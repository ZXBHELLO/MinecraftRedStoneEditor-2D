/**
 * 组件定义与组件面板渲染模块。
 *
 * 数据：
 * - components：按四个分类组织的组件表（id 必须与 assets/ 下的图片文件名一致）
 * - COMPONENT_NAMES_EN：全部组件的英文显示名（状态栏与 tooltip 国际化用）
 * - COMPONENT_FORMATS：每个组件图片的实际格式（由 assets 目录扫描生成，
 *   避免加载时逐格式尝试产生 404 噪音）
 * - PINYIN_MAP：组件名覆盖汉字的拼音表（内置，替代外部 CDN 依赖，
 *   支持离线使用并消除控制台报错）
 *
 * 职责：
 * - 渲染组件面板（分类标题 + 网格按钮），每个按钮带图片或文字占位
 * - 组件选择（selectComponent）与搜索过滤（支持中文/拼音/英文/id）
 * - 组件名本地化（getComponentName，按当前语言返回中/英文名）
 *
 * 依赖：
 * - lang.js（lang / getCurrentLanguage）
 * - utils.js（AppState / updateStatusBar / updateDynamicText）
 */

/** 分类标题对应的 FontAwesome 图标 */
const CATEGORY_ICONS = {
  '基础方块': 'fa-cube',
  '机械元件': 'fa-cogs',
  '装饰方块': 'fa-paint-brush',
  '特殊方块': 'fa-star'
};

/** 分类名 → 国际化词条键 */
const CATEGORY_LANG_KEYS = {
  '基础方块': 'category_basic',
  '机械元件': 'category_mechanical',
  '装饰方块': 'category_decorative',
  '特殊方块': 'category_special'
};

/**
 * 组件图片的实际格式清单（webp / png）。
 * 由 assets 目录生成：绝大多数组件为 webp，仅 7 个为 png。
 * 加载时按此表直接取用，避免逐格式尝试产生无意义的 404 请求。
 */
const COMPONENT_FORMATS = {
  powderedsnow: 'png',
  cactus: 'png',
  dirt_path: 'png',
  daylight_detector: 'png',
  enchanting_table: 'png',
  end_portal_frame: 'png',
  stonecutter: 'png'
};

/**
 * 内置拼音表：覆盖组件名中出现的全部汉字（按组件语境取音）。
 * 用于拼音 / 拼音首字母搜索，完全离线、无外部依赖。
 */
const PINYIN_MAP = {
  空:'kong',气:'qi',基:'ji',岩:'yan',平:'ping',滑:'hua',石:'shi',黑:'hei',曜:'yao',
  粘:'zhan',液:'ye',块:'kuai',蜂:'feng',蜜:'mi',铁:'tie',红:'hong',脚:'jiao',手:'shou',
  架:'jia',细:'xi',雪:'xue',冰:'bing',沙:'sha',子:'zi',灵:'ling',魂:'hun',浆:'jiang',
  玻:'bo',璃:'li',淡:'dan',蓝:'lan',色:'se',板:'ban',白:'bai',羊:'yang',毛:'mao',
  灰:'hui',釉:'you',陶:'tao',台:'tai',阶:'jie',混:'hun',凝:'ning',土:'tu',磨:'mo',
  制:'zhi',深:'shen',闪:'shan',长:'chang',花:'hua',岗:'gang',仙:'xian',人:'ren',
  掌:'zhang',草:'cao',径:'jing',粉:'fen',激:'ji',火:'huo',把:'ba',左:'zuo',侧:'ce',
  右:'you',继:'ji',器:'qi',比:'bi',较:'jiao',灯:'deng',铜:'tong',亮:'liang',塞:'sai',
  上:'shang',下:'xia',前:'qian',后:'hou',头:'tou',体:'ti',侦:'zhen',测:'ce',投:'tou',
  掷:'zhi',工:'gong',作:'zuo',漏:'lou',斗:'dou',标:'biao',靶:'ba',轨:'gui',动:'dong',
  力:'li',栅:'zha',栏:'lan',门:'men',关:'guan',开:'kai',木:'mu',音:'yin',符:'fu',
  盒:'he',阳:'yang',光:'guang',传:'chuan',感:'gan',酿:'niang',造:'zao',洞:'dong',
  穴:'xue',藤:'teng',蔓:'man',有:'you',果:'guo',实:'shi',失:'shi',的:'de',珊:'shan',
  瑚:'hu',扇:'shan',末:'mo',影:'ying',箱:'xiang',苔:'tai',藓:'xian',橡:'xiang',
  原:'yuan',樱:'ying',树:'shu',叶:'ye',雕:'diao',纹:'wen',书:'shu',双:'shuang',
  潜:'qian',桶:'tong',炼:'lian',药:'yao',锅:'guo',堆:'dui',肥:'fei',蛋:'dan',糕:'gao',
  巢:'chao',大:'da',型:'xing',垂:'chui',滴:'di',刻:'ke',南:'nan',瓜:'gua',紫:'zi',
  颂:'song',枯:'ku',萎:'wei',蜘:'zhi',蛛:'zhu',网:'wang',附:'fu',魔:'mo',地:'di',
  送:'song',熔:'rong',炉:'lu',高:'gao',烟:'yan',熏:'xun',切:'qie',机:'ji',生:'sheng',
  重:'chong',锚:'mao',刷:'shua',怪:'guai',笼:'long',水:'shui',未:'wei',知:'zhi',
  方:'fang',屏:'ping',障:'zhang'
};

/**
 * 将中文文本转换为全拼字符串（仅转换汉字，其他字符跳过）。
 * @param {string} text 中文文本
 * @returns {string} 例如 "红石粉" → "hongshifen"
 */
function getPinyin(text) {
  let result = '';
  for (const ch of text) {
    if (PINYIN_MAP[ch]) result += PINYIN_MAP[ch];
  }
  return result;
}

/**
 * 将中文文本转换为拼音首字母串（每字取声母首字母）。
 * @param {string} text 中文文本
 * @returns {string} 例如 "红石粉" → "hsf"
 */
function getPinyinInitials(text) {
  let result = '';
  for (const ch of text) {
    if (PINYIN_MAP[ch]) result += PINYIN_MAP[ch][0];
  }
  return result;
}

/**
 * 返回组件的本地化显示名（英文环境返回英文名，否则返回中文名）。
 * @param {object} compData 组件定义 {id, name}
 * @returns {string}
 */
function getComponentName(compData) {
  if (!compData) return '';
  if (getCurrentLanguage() === 'en_us') {
    return COMPONENT_NAMES_EN[compData.id] || compData.name;
  }
  return compData.name;
}

// English display names for every component (used in the status bar and panel tooltips)
const COMPONENT_NAMES_EN = {
  air: 'Air',
  bedrock: 'Bedrock',
  smoothstone: 'Smooth Stone',
  obsidian: 'Obsidian',
  slimeblock: 'Slime Block',
  honeyblock: 'Honey Block',
  ironblock: 'Iron Block',
  rsblock: 'Redstone Block',
  scaffolding: 'Scaffolding',
  powderedsnow: 'Powdered Snow',
  ice: 'Ice',
  sand: 'Sand',
  soulsand: 'Soul Sand',
  magma: 'Magma Block',
  glass: 'Glass',
  light_blue_stained_glass: 'Light Blue Stained Glass',
  light_blue_stained_glass_pane_top: 'Light Blue Stained Glass Pane',
  white_wool: 'White Wool',
  gray_wool: 'Gray Wool',
  glazedterracotta: 'Glazed Terracotta',
  slabt: 'Stone Slab',
  white_concrete: 'White Concrete',
  polished_deepslate: 'Polished Deepslate',
  polished_diorite: 'Polished Diorite',
  polished_granite: 'Polished Granite',
  cactus: 'Cactus',
  dirt_path: 'Dirt Path',
  duston: 'Redstone Dust (On)',
  dustoff: 'Redstone Dust',
  torchon: 'Redstone Torch (On)',
  torchoff: 'Redstone Torch',
  torchlon: 'Left Redstone Torch (On)',
  torchloff: 'Left Redstone Torch',
  torchron: 'Right Redstone Torch (On)',
  torchroff: 'Right Redstone Torch',
  repeaterlon: 'Left Repeater (On)',
  repeaterloff: 'Left Repeater',
  repeaterron: 'Right Repeater (On)',
  repeaterroff: 'Right Repeater',
  comparatorlon: 'Left Comparator (On)',
  comparatorloff: 'Left Comparator',
  comparatorron: 'Right Comparator (On)',
  comparatorroff: 'Right Comparator',
  lampon: 'Redstone Lamp (On)',
  lampoff: 'Redstone Lamp',
  copper_bulb_lit: 'Copper Bulb (Lit)',
  copper_bulb_unlit: 'Copper Bulb',
  pistonu: 'Piston (Up)',
  pistond: 'Piston (Down)',
  pistonl: 'Piston (Left)',
  pistonr: 'Piston (Right)',
  pistonf: 'Piston (Front)',
  pistonb: 'Piston (Back)',
  pistonheadd: 'Piston Head (Down)',
  pistonheadl: 'Piston Head (Left)',
  pistonheadr: 'Piston Head (Right)',
  pistonheadu: 'Piston Head (Up)',
  pistonbodyd: 'Piston Body (Down)',
  pistonbodyl: 'Piston Body (Left)',
  pistonbodyr: 'Piston Body (Right)',
  pistonbodyu: 'Piston Body (Up)',
  stickypistonu: 'Sticky Piston (Up)',
  stickypistond: 'Sticky Piston (Down)',
  stickypistonl: 'Sticky Piston (Left)',
  stickypistonr: 'Sticky Piston (Right)',
  stickypistonf: 'Sticky Piston (Front)',
  stickypistonb: 'Sticky Piston (Back)',
  stickypistonheadd: 'Sticky Piston Head (Down)',
  stickypistonheadl: 'Sticky Piston Head (Left)',
  stickypistonheadr: 'Sticky Piston Head (Right)',
  stickypistonheadu: 'Sticky Piston Head (Up)',
  observeru: 'Observer (Up)',
  observerd: 'Observer (Down)',
  observerl: 'Observer (Left)',
  observerr: 'Observer (Right)',
  observerf: 'Observer (Front)',
  observerb: 'Observer (Back)',
  dropperu: 'Dropper (Up)',
  dropperd: 'Dropper (Down)',
  dropperl: 'Dropper (Left)',
  dropperr: 'Dropper (Right)',
  dropperf: 'Dropper (Front)',
  crafter: 'Crafter',
  crafteru: 'Crafter (Up)',
  crafterd: 'Crafter (Down)',
  crafterl: 'Crafter (Left)',
  crafterr: 'Crafter (Right)',
  hopperd: 'Hopper (Down)',
  hopperl: 'Hopper (Left)',
  hopperr: 'Hopper (Right)',
  hopperb: 'Hopper (Back)',
  target: 'Target Block',
  arail: 'Activator Rail',
  arailsl: 'Left Activator Rail',
  arailsr: 'Right Activator Rail',
  prail: 'Powered Rail',
  prailsl: 'Left Powered Rail',
  prailsr: 'Right Powered Rail',
  fencegatec: 'Fence Gate (Closed)',
  fencegateo: 'Fence Gate (Open)',
  trapdooru: 'Trapdoor (Up)',
  trapdoord: 'Trapdoor (Down)',
  trapdoorl: 'Trapdoor (Left)',
  trapdoorr: 'Trapdoor (Right)',
  wtrapdooru: 'Wooden Trapdoor (Up)',
  wtrapdoord: 'Wooden Trapdoor (Down)',
  wtrapdoorl: 'Wooden Trapdoor (Left)',
  wtrapdoorr: 'Wooden Trapdoor (Right)',
  noteblock: 'Note Block',
  daylight_detector: 'Daylight Detector',
  tnt: 'TNT',
  iron_door_top: 'Iron Door (Top)',
  brewing_stand: 'Brewing Stand',
  cave_vines_berries: 'Cave Vines (Berries)',
  dead_coral_fan: 'Dead Coral Fan',
  iron_door_bottom: 'Iron Door (Bottom)',
  ender_chest: 'Ender Chest',
  moss_block: 'Moss Block',
  oak_log: 'Oak Log',
  cherry_leaves: 'Cherry Leaves',
  chiseled_bookshelf: 'Chiseled Bookshelf',
  chest: 'Chest',
  chestdl: 'Double Chest (Left)',
  chestdr: 'Double Chest (Right)',
  shulkerboxu: 'Shulker Box (Up)',
  shulkerboxd: 'Shulker Box (Down)',
  shulkerboxl: 'Shulker Box (Left)',
  shulkerboxr: 'Shulker Box (Right)',
  barrel: 'Barrel',
  cauldron: 'Cauldron',
  composter: 'Composter',
  cake: 'Cake',
  beehive: 'Beehive',
  bee_nest: 'Bee Nest',
  big_dripleaf_top: 'Big Dripleaf (Top)',
  carved_pumpkin: 'Carved Pumpkin',
  pumpkin_lantern: "Jack o'Lantern",
  chorus_flower: 'Chorus Flower',
  chorus_flower_dead: 'Chorus Flower (Dead)',
  cobweb: 'Cobweb',
  enchanting_table: 'Enchanting Table',
  end_portal_frame: 'End Portal Frame',
  furnace: 'Furnace',
  blast_furnace: 'Blast Furnace',
  smoker_front: 'Smoker',
  stonecutter: 'Stonecutter',
  respawn_anchor: 'Respawn Anchor',
  spawner: 'Monster Spawner',
  water: 'Water',
  lava: 'Lava',
  fire: 'Fire',
  unknown: 'Unknown Block',
  barrier: 'Barrier'
};

const components = {
  '基础方块': [
    { id: 'air', name: '空气' },
    { id: 'bedrock', name: '基岩' },
    { id: 'smoothstone', name: '平滑石' },
    { id: 'obsidian', name: '黑曜石' },
    { id: 'slimeblock', name: '粘液块' },
    { id: 'honeyblock', name: '蜂蜜块' },
    { id: 'ironblock', name: '铁块' },
    { id: 'rsblock', name: '红石块' },
    { id: 'scaffolding', name: '脚手架' },
    { id: 'powderedsnow', name: '细雪' },
    { id: 'ice', name: '冰' },
    { id: 'sand', name: '沙子' },
    { id: 'soulsand', name: '灵魂沙' },
    { id: 'magma', name: '岩浆块' },
    { id: 'glass', name: '玻璃' },
    { id: 'light_blue_stained_glass', name: '淡蓝色玻璃' },
    { id: 'light_blue_stained_glass_pane_top', name: '淡蓝色玻璃板' },
    { id: 'white_wool', name: '白色羊毛' },
    { id: 'gray_wool', name: '灰色羊毛' },
    { id: 'glazedterracotta', name: '釉陶' },
    { id: 'slabt', name: '石台阶' },
    { id: 'white_concrete', name: '白色混凝土' },
    { id: 'polished_deepslate', name: '磨制深板岩' },
    { id: 'polished_diorite', name: '磨制闪长岩' },
    { id: 'polished_granite', name: '磨制花岗岩' },
    { id: 'cactus', name: '仙人掌' },
    { id: 'dirt_path', name: '草径' }
  ],
  '机械元件': [
    { id: 'duston', name: '红石粉（激活）' },
    { id: 'dustoff', name: '红石粉' },
    { id: 'torchon', name: '红石火把（激活）' },
    { id: 'torchoff', name: '红石火把' },
    { id: 'torchlon', name: '左侧红石火把（激活）' },
    { id: 'torchloff', name: '左侧红石火把' },
    { id: 'torchron', name: '右侧红石火把（激活）' },
    { id: 'torchroff', name: '右侧红石火把' },
    { id: 'repeaterlon', name: '左侧中继器（激活）' },
    { id: 'repeaterloff', name: '左侧中继器' },
    { id: 'repeaterron', name: '右侧中继器（激活）' },
    { id: 'repeaterroff', name: '右侧中继器' },
    { id: 'comparatorlon', name: '左侧比较器（激活）' },
    { id: 'comparatorloff', name: '左侧比较器' },
    { id: 'comparatorron', name: '右侧比较器（激活）' },
    { id: 'comparatorroff', name: '右侧比较器' },
    { id: 'lampon', name: '红石灯（激活）' },
    { id: 'lampoff', name: '红石灯' },
    { id: 'copper_bulb_lit', name: '铜灯（亮）' },
    { id: 'copper_bulb_unlit', name: '铜灯' },
    { id: 'pistonu', name: '活塞（上）' },
    { id: 'pistond', name: '活塞（下）' },
    { id: 'pistonl', name: '活塞（左）' },
    { id: 'pistonr', name: '活塞（右）' },
    { id: 'pistonf', name: '活塞（前）' },
    { id: 'pistonb', name: '活塞（后）' },
    { id: 'pistonheadd', name: '活塞头（下）' },
    { id: 'pistonheadl', name: '活塞头（左）' },
    { id: 'pistonheadr', name: '活塞头（右）' },
    { id: 'pistonheadu', name: '活塞头（上）' },
    { id: 'pistonbodyd', name: '活塞体（下）' },
    { id: 'pistonbodyl', name: '活塞体（左）' },
    { id: 'pistonbodyr', name: '活塞体（右）' },
    { id: 'pistonbodyu', name: '活塞体（上）' },
    { id: 'stickypistonu', name: '粘性活塞（上）' },
    { id: 'stickypistond', name: '粘性活塞（下）' },
    { id: 'stickypistonl', name: '粘性活塞（左）' },
    { id: 'stickypistonr', name: '粘性活塞（右）' },
    { id: 'stickypistonf', name: '粘性活塞（前）' },
    { id: 'stickypistonb', name: '粘性活塞（后）' },
    { id: 'stickypistonheadd', name: '粘性活塞头（下）' },
    { id: 'stickypistonheadl', name: '粘性活塞头（左）' },
    { id: 'stickypistonheadr', name: '粘性活塞头（右）' },
    { id: 'stickypistonheadu', name: '粘性活塞头（上）' },
    { id: 'observeru', name: '侦测器（上）' },
    { id: 'observerd', name: '侦测器（下）' },
    { id: 'observerl', name: '侦测器（左）' },
    { id: 'observerr', name: '侦测器（右）' },
    { id: 'observerf', name: '侦测器（前）' },
    { id: 'observerb', name: '侦测器（后）' },
    { id: 'dropperu', name: '投掷器（上）' },
    { id: 'dropperd', name: '投掷器（下）' },
    { id: 'dropperl', name: '投掷器（左）' },
    { id: 'dropperr', name: '投掷器（右）' },
    { id: 'dropperf', name: '投掷器（前）' },
    { id: 'crafter', name: '工作台' },
    { id: 'crafteru', name: '工作台（上）' },
    { id: 'crafterd', name: '工作台（下）' },
    { id: 'crafterl', name: '工作台（左）' },
    { id: 'crafterr', name: '工作台（右）' },
    { id: 'hopperd', name: '漏斗（下）' },
    { id: 'hopperl', name: '漏斗（左）' },
    { id: 'hopperr', name: '漏斗（右）' },
    { id: 'hopperb', name: '漏斗（后）' },
    { id: 'target', name: '标靶' },
    { id: 'arail', name: '激活铁轨' },
    { id: 'arailsl', name: '左激活铁轨' },
    { id: 'arailsr', name: '右激活铁轨' },
    { id: 'prail', name: '动力铁轨' },
    { id: 'prailsl', name: '左动力铁轨' },
    { id: 'prailsr', name: '右动力铁轨' },
    { id: 'fencegatec', name: '栅栏门（关）' },
    { id: 'fencegateo', name: '栅栏门（开）' },
    { id: 'trapdooru', name: '活板门（上）' },
    { id: 'trapdoord', name: '活板门（下）' },
    { id: 'trapdoorl', name: '活板门（左）' },
    { id: 'trapdoorr', name: '活板门（右）' },
    { id: 'wtrapdooru', name: '木活板门（上）' },
    { id: 'wtrapdoord', name: '木活板门（下）' },
    { id: 'wtrapdoorl', name: '木活板门（左）' },
    { id: 'wtrapdoorr', name: '木活板门（右）' },
    { id: 'noteblock', name: '音符盒' },
    { id: 'daylight_detector', name: '阳光传感器' },
    { id: 'tnt', name: 'TNT' }
  ],
  '装饰方块': [
    { id: 'iron_door_top', name: '铁门（上）' },
    { id: 'brewing_stand', name: '酿造台' },
    { id: 'cave_vines_berries', name: '洞穴藤蔓（有果实）' },
    { id: 'dead_coral_fan', name: '失活的珊瑚扇' },
    { id: 'iron_door_bottom', name: '铁门（下）' },
    { id: 'ender_chest', name: '末影箱' },
    { id: 'moss_block', name: '苔藓' },
    { id: 'oak_log', name: '橡木原木' },
    { id: 'cherry_leaves', name: '樱花树叶' },
    { id: 'chiseled_bookshelf', name: '雕纹书架' },
    { id: 'chest', name: '箱子' },
    { id: 'chestdl', name: '双箱子（左）' },
    { id: 'chestdr', name: '双箱子（右）' },
    { id: 'shulkerboxu', name: '潜影盒（上）' },
    { id: 'shulkerboxd', name: '潜影盒（下）' },
    { id: 'shulkerboxl', name: '潜影盒（左）' },
    { id: 'shulkerboxr', name: '潜影盒（右）' },
    { id: 'barrel', name: '木桶' },
    { id: 'cauldron', name: '炼药锅' },
    { id: 'composter', name: '堆肥桶' },
    { id: 'cake', name: '蛋糕' },
    { id: 'beehive', name: '蜂箱' },
    { id: 'bee_nest', name: '蜂巢' },
    { id: 'big_dripleaf_top', name: '大型垂滴叶' },
    { id: 'carved_pumpkin', name: '雕刻南瓜' },
    { id: 'pumpkin_lantern', name: '南瓜灯' },
    { id: 'chorus_flower', name: '紫颂花' },
    { id: 'chorus_flower_dead', name: '枯萎紫颂花' },
    { id: 'cobweb', name: '蜘蛛网' },
    { id: 'enchanting_table', name: '附魔台' },
    { id: 'end_portal_frame', name: '末地传送门' },
    { id: 'furnace', name: '熔炉' },
    { id: 'blast_furnace', name: '高炉' },
    { id: 'smoker_front', name: '烟熏炉' },
    { id: 'stonecutter', name: '切石机' },
    { id: 'respawn_anchor', name: '重生锚' },
    { id: 'spawner', name: '刷怪笼' }
  ],
  '特殊方块': [
    { id: 'water', name: '水' },
    { id: 'lava', name: '熔岩' },
    { id: 'fire', name: '火' },
    { id: 'unknown', name: '未知方块' },
    { id: 'barrier', name: '屏障' }
  ]
};

/** 展开全部分类，返回组件定义数组 */
function getAllComponents() {
  return Object.values(components).flat();
}

/**
 * 渲染组件面板：清空列表后按分类创建（标题 + 组件网格），
 * 并默认选中"空气"。
 */
function loadComponents() {
  const componentsList = document.getElementById('components-list');
  if (!componentsList) return;

  componentsList.innerHTML = '';

  for (const [category, comps] of Object.entries(components)) {
    const categoryDiv = createCategoryElement(category, comps);
    componentsList.appendChild(categoryDiv);
  }

  selectComponent('air');
}

/**
 * 创建单个分类区块（标题行 + 组件网格）。
 * @param {string} category 分类名（中文，作为配置表键）
 * @param {Array<object>} comps 该分类下的组件定义数组
 * @returns {HTMLElement}
 */
function createCategoryElement(category, comps) {
  const categoryDiv = document.createElement('div');
  categoryDiv.className = 'category';
  categoryDiv.dataset.category = category;

  const title = document.createElement('h3');
  const icon = document.createElement('i');
  icon.className = `fas ${CATEGORY_ICONS[category] || 'fa-cube'}`;
  title.appendChild(icon);

  const categoryNameSpan = document.createElement('span');
  categoryNameSpan.dataset.lang = CATEGORY_LANG_KEYS[category];
  categoryNameSpan.textContent = lang(CATEGORY_LANG_KEYS[category]);
  title.appendChild(categoryNameSpan);

  const gridDiv = document.createElement('div');
  gridDiv.className = 'components-grid';

  comps.forEach(compData => {
    const compDiv = createComponentElement(compData);
    gridDiv.appendChild(compDiv);
  });

  categoryDiv.appendChild(title);
  categoryDiv.appendChild(gridDiv);

  return categoryDiv;
}

/**
 * 创建单个组件按钮（图片 + 选中态 + 点击选择）。
 * 图片缺失时显示 id 前 3 字符作为占位。
 * @param {object} compData 组件定义 {id, name}
 * @returns {HTMLElement}
 */
function createComponentElement(compData) {
  const compDiv = document.createElement('div');
  compDiv.className = 'component';
  compDiv.dataset.id = compData.id;
  compDiv.dataset.name = compData.name;
  compDiv.dataset.nameEn = COMPONENT_NAMES_EN[compData.id] || '';
  compDiv.dataset.pinyin = getPinyin(compData.name);
  compDiv.dataset.pinyinInitials = getPinyinInitials(compData.name);
  compDiv.title = getComponentName(compData);

  if (AppState.images[compData.id]) {
    const img = document.createElement('img');
    img.src = AppState.images[compData.id].src;
    img.alt = compData.id;
    compDiv.appendChild(img);
  } else {
    const fallback = document.createElement('div');
    fallback.className = 'component-fallback';
    fallback.textContent = compData.id.substring(0, 3);
    compDiv.appendChild(fallback);
  }

  compDiv.addEventListener('click', (e) => {
    e.stopPropagation();
    selectComponent(compData.id);
  });

  return compDiv;
}

/**
 * 选中指定组件：更新选中高亮、状态栏当前组件文本。
 * @param {string} id 组件 id
 */
function selectComponent(id) {
  AppState.selectedComponent = id;

  document.querySelectorAll('.component').forEach(comp => {
    comp.classList.toggle('selected', comp.dataset.id === id);
  });

  const compData = getAllComponents().find(c => c.id === id);
  const compName = getComponentName(compData);
  updateDynamicText('current-component', compName);

  updateStatusBar();
}

/** 按搜索词过滤组件：隐藏不匹配的组件与其空分类 */
function filterComponents() {
  const searchTerm = document.getElementById('component-search')?.value.trim().toLowerCase();
  const categories = document.querySelectorAll('.category');

  categories.forEach(category => {
    const comps = category.querySelectorAll('.component');
    let hasVisible = false;

    comps.forEach(comp => {
      const isVisible = !searchTerm || matchesSearch(comp.dataset, searchTerm);
      comp.style.display = isVisible ? 'flex' : 'none';
      if (isVisible) hasVisible = true;
    });

    category.style.display = hasVisible ? 'block' : 'none';
  });
}

/**
 * 判断组件是否匹配搜索词（id / 中文名 / 英文名 / 拼音 / 拼音首字母）。
 * @param {DOMStringMap} dataset 组件按钮的 data-* 属性
 * @param {string} searchTerm 小写搜索词
 * @returns {boolean}
 */
function matchesSearch(dataset, searchTerm) {
  const { id = '', name = '', nameEn = '', pinyin = '', pinyinInitials = '' } = dataset;

  return (
    id.toLowerCase().includes(searchTerm) ||
    name.toLowerCase().includes(searchTerm) ||
    nameEn.toLowerCase().includes(searchTerm) ||
    pinyin.includes(searchTerm) ||
    pinyinInitials.includes(searchTerm)
  );
}
