const components = {
    "基础方块": [
        {id: "air", name: "空气"},
        {id: "bedrock", name: "基岩"},
        {id: "smoothstone", name: "平滑石"},
        {id: "obsidian", name: "黑曜石"},
        {id: "slimeblock", name: "粘液块"},
        {id: "honeyblock", name: "蜂蜜块"},
        {id: "ironblock", name: "铁块"},
        {id: "rsblock", name: "红石块"},
        {id: "scaffolding", name: "脚手架"},
        {id: "powderedsnow", name: "细雪"},
        {id: "ice", name: "冰"},
        {id: "sand", name: "沙子"},
        {id: "soulsand", name: "灵魂沙"},
        {id: "magma", name: "岩浆块"},
        {id: "glass", name: "玻璃"},
        {id: "light_blue_stained_glass", name: "淡蓝色玻璃"},
        {id: "light_blue_stained_glass_pane_top", name: "淡蓝色玻璃板"},
        {id: "white_wool", name: "白色羊毛"},
        {id: "gray_wool", name: "灰色羊毛"},
        {id: "glazedterracotta", name: "釉陶"},
        {id: "slabt", name: "石台阶"},
        {id: "white_concrete", name: "白色混凝土"},
        {id: "polished_deepslate", name: "磨制深板岩"},
        {id: "polished_diorite", name: "磨制闪长岩"},
        {id: "polished_granite", name: "磨制花岗岩"},
        {id: "cactus", name: "仙人掌"},
        {id: "dirt_path", name: "草径"}
    ],
    "机械元件": [
        {id: "duston", name: "红石粉（激活）"},
        {id: "dustoff", name: "红石粉"},
        {id: "torchon", name: "红石火把（激活）"},
        {id: "torchoff", name: "红石火把"},
        {id: "torchlon", name: "左侧红石火把（激活）"},
        {id: "torchloff", name: "左侧红石火把"},
        {id: "torchron", name: "右侧红石火把（激活）"},
        {id: "torchroff", name: "右侧红石火把"},
        {id: "repeaterlon", name: "左侧中继器（激活）"},
        {id: "repeaterloff", name: "左侧中继器"},
        {id: "repeaterron", name: "右侧中继器（激活）"},
        {id: "repeaterroff", name: "右侧中继器"},
        {id: "comparatorlon", name: "左侧比较器（激活）"},
        {id: "comparatorloff", name: "左侧比较器"},
        {id: "comparatorron", name: "右侧比较器（激活）"},
        {id: "comparatorroff", name: "右侧比较器"},
        {id: "lampon", name: "红石灯（激活）"},
        {id: "lampoff", name: "红石灯"},
        {id: "copper_bulb_lit", name: "铜灯（亮）"},
        {id: "copper_bulb_unlit", name: "铜灯"},
        {id: "pistonu", name: "活塞（上）"},
        {id: "pistond", name: "活塞（下）"},
        {id: "pistonl", name: "活塞（左）"},
        {id: "pistonr", name: "活塞（右）"},
        {id: "pistonf", name: "活塞（前）"},
        {id: "pistonb", name: "活塞（后）"},
        {id: "pistonheadd", name: "活塞头（下）"},
        {id: "pistonheadl", name: "活塞头（左）"},
        {id: "pistonheadr", name: "活塞头（右）"},
        {id: "pistonheadu", name: "活塞头（上）"},
        {id: "pistonbodyd", name: "活塞体（下）"},
        {id: "pistonbodyl", name: "活塞体（左）"},
        {id: "pistonbodyr", name: "活塞体（右）"},
        {id: "pistonbodyu", name: "活塞体（上）"},
        {id: "stickypistonu", name: "粘性活塞（上）"},
        {id: "stickypistond", name: "粘性活塞（下）"},
        {id: "stickypistonl", name: "粘性活塞（左）"},
        {id: "stickypistonr", name: "粘性活塞（右）"},
        {id: "stickypistonf", name: "粘性活塞（前）"},
        {id: "stickypistonb", name: "粘性活塞（后）"},
        {id: "stickypistonheadd", name: "粘性活塞头（下）"},
        {id: "stickypistonheadl", name: "粘性活塞头（左）"},
        {id: "stickypistonheadr", name: "粘性活塞头（右）"},
        {id: "stickypistonheadu", name: "粘性活塞头（上）"},
        {id: "observeru", name: "侦测器（上）"},
        {id: "observerd", name: "侦测器（下）"},
        {id: "observerl", name: "侦测器（左）"},
        {id: "observerr", name: "侦测器（右）"},
        {id: "observerf", name: "侦测器（前）"},
        {id: "observerb", name: "侦测器（后）"},
        {id: "dropperu", name: "投掷器（上）"},
        {id: "dropperd", name: "投掷器（下）"},
        {id: "dropperl", name: "投掷器（左）"},
        {id: "dropperr", name: "投掷器（右）"},
        {id: "dropperf", name: "投掷器（前）"},
        {id: "dropperd", name: "投掷器（后）"},
        {id: "crafter", name: "工作台"},
        {id: "crafteru", name: "工作台（上）"},
        {id: "crafterd", name: "工作台（下）"},
        {id: "crafterl", name: "工作台（左）"},
        {id: "crafterr", name: "工作台（右）"},
        {id: "hopperd", name: "漏斗（下）"},
        {id: "hopperl", name: "漏斗（左）"},
        {id: "hopperr", name: "漏斗（右）"},
        {id: "hopperb", name: "漏斗（后）"},
        {id: "target", name: "标靶"},
        {id: "arail", name: "激活铁轨"},
        {id: "arailsl", name: "左激活铁轨"},
        {id: "arailsr", name: "右激活铁轨"},
        {id: "prail", name: "动力铁轨"},
        {id: "prailsl", name: "左动力铁轨"},
        {id: "prailsr", name: "右动力铁轨"},
        {id: "fencegatec", name: "栅栏门（关）"},
        {id: "fencegateo", name: "栅栏门（开）"},
        {id: "trapdooru", name: "活板门（上）"},
        {id: "trapdoord", name: "活板门（下）"},
        {id: "trapdoorl", name: "活板门（左）"},
        {id: "trapdoorr", name: "活板门（右）"},
        {id: "wtrapdooru", name: "木活板门（上）"},
        {id: "wtrapdoord", name: "木活板门（下）"},
        {id: "wtrapdoorl", name: "木活板门（左）"},
        {id: "wtrapdoorr", name: "木活板门（右）"},
        {id: "noteblock", name: "音符盒"},
        {id: "daylight_detector", name: "阳光传感器"},
        {id: "tnt", name: "TNT"}
    ],
    "装饰方块": [
        {id: "iron_door_top",       name: "铁门（上）"},
        {id: "brewing_stand",       name: "酿造台"},
        {id: "cave_vines_berries",  name: "洞穴藤蔓（有果实）"},
        {id: "dead_coral_fan",      name: "失活的珊瑚扇"},
        {id: "iron_door_bottom",    name: "铁门（下）"},
        {id: "ender_chest", name: "末影箱"},
        {id: "moss_block", name: "苔藓"},
        {id: "oak_log", name: "橡木原木"},
        {id: "cherry_leaves", name: "樱花树叶"},
        {id: "chiseled_bookshelf", name: "雕纹书架"},
        {id: "chest", name: "箱子"},
        {id: "chestdl", name: "双箱子（左）"},
        {id: "chestdr", name: "双箱子（右）"},
        {id: "shulkerboxu", name: "潜影盒（上）"},
        {id: "shulkerboxd", name: "潜影盒（下）"},
        {id: "shulkerboxl", name: "潜影盒（左）"},
        {id: "shulkerboxr", name: "潜影盒（右）"},
        {id: "barrel", name: "木桶"},
        {id: "cauldron", name: "炼药锅"},
        {id: "composter", name: "堆肥桶"},
        {id: "cake", name: "蛋糕"},
        {id: "beehive", name: "蜂箱"},
        {id: "bee_nest", name: "蜂巢"},
        {id: "big_dripleaf_top", name: "大型垂滴叶"},
        {id: "carved_pumpkin", name: "雕刻南瓜"},
        {id: "pumpkin_lantern", name: "南瓜灯"},
        {id: "chorus_flower", name: "紫颂花"},
        {id: "chorus_flower_dead", name: "枯萎紫颂花"},
        {id: "cobweb", name: "蜘蛛网"},
        {id: "enchanting_table", name: "附魔台"},
        {id: "end_portal_frame", name: "末地传送门"},
        {id: "furnace", name: "熔炉"},
        {id: "blast_furnace", name: "高炉"},
        {id: "smoker_front", name: "烟熏炉"},
        {id: "stonecutter", name: "切石机"},
        {id: "respawn_anchor", name: "重生锚"},
        {id: "spawner", name: "刷怪笼"}
    ],
    "特殊方块": [
        {id: "water", name: "水"},
        {id: "lava", name: "熔岩"},
        {id: "fire", name: "火"},
        {id: "unknown", name: "未知方块"},
        {id: "barrier", name: "屏障"}
    ]
};

function loadComponents() {
  try {
    const componentsList = document.getElementById('components-list');
    if (!componentsList) throw new Error('Components list element not found');
    componentsList.innerHTML = '';
    for (const [category, comps] of Object.entries(components)) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category';
      categoryDiv.dataset.category = category;
      const title = document.createElement('h3');
      const icon = document.createElement('i');
      if (category === "基础方块") icon.className = "fas fa-cube";
      else if (category === "机械元件") icon.className = "fas fa-cogs";
      else if (category === "装饰方块") icon.className = "fas fa-paint-brush";
      else if (category === "特殊方块") icon.className = "fas fa-star";
      title.appendChild(icon);
      title.appendChild(document.createTextNode(category));
      categoryDiv.appendChild(title);
      const gridDiv = document.createElement('div');
      gridDiv.className = 'components-grid';

      const pinyin = new Pinyin({checkPolyphone: false, charCase: 0});
        
      comps.forEach(compData => {
        const compDiv = document.createElement('div');
        compDiv.className = 'component';
        compDiv.dataset.id = compData.id;
        compDiv.dataset.name = compData.name;
        compDiv.dataset.pinyin = pinyin.getFullChars(compData.name)
        if (images[compData.id]) {
          compDiv.innerHTML = `<img src="${images[compData.id].src}" alt="${compData.id}">`;
        } else {
          compDiv.innerHTML = `<div style="width:30px;height:30px;background:#eee;display:flex;align-items:center;justify-content:center;color:#888;font-size:10px;">${compData.id}</div>`;
        }
        compDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          selectComponent(compData.id);
        });
        gridDiv.appendChild(compDiv);
      });
      categoryDiv.appendChild(gridDiv);
      componentsList.appendChild(categoryDiv);
    }
    selectComponent('air');
  } catch (error) {
    displayError(`loadComponents error: ${error.message}`);
  }
}

function selectComponent(id) {
  try {
    selectedComponent = id;
    document.querySelectorAll('.component').forEach(comp => {
      comp.classList.toggle('selected', comp.dataset.id === id);
    });
    const compData = getAllComponents().find(c => c.id === id);
    document.querySelector('#current-component span').textContent = compData ? compData.name : id;
    updateStatusBar();
  } catch (error) {
    displayError(`selectComponent error: ${error.message}`);
  }
}

function getAllComponents() {
  try {
    return Object.values(components).flat();
  } catch (error) {
    displayError(`getAllComponents error: ${error.message}`);
    return [];
  }
}

function filterComponents() {
  try {
    const searchTerm = document.getElementById('component-search').value.trim().toLowerCase();
    const categories = document.querySelectorAll('.category');
    const allComponents = getAllComponents();
    if (!searchTerm) {
      categories.forEach(category => {
        category.style.display = 'block';
        const components = category.querySelectorAll('.component');
        components.forEach(comp => {
          comp.style.display = 'flex';
        });
      });
      return;
    }
    categories.forEach(category => {
      const comps = category.querySelectorAll('.component');
      let hasVisible = false;
      comps.forEach(comp => {
        const id = comp.dataset.id;
        const name = comp.dataset.name;
        const pinyin = comp.dataset.pinyin;
        const matchId = id.toLowerCase().includes(searchTerm);
        const matchName = name.toLowerCase().includes(searchTerm);
        const matchPinyin = pinyin.toLowerCase().includes(searchTerm);
        const pinyinInitials = pinyin.split('').filter(char => /[a-z]/.test(char) && !/[aeiouv]/.test(char)).join('');
        const matchInitials = pinyinInitials.toLowerCase().includes(searchTerm);
        if (matchId || matchName || matchPinyin || matchInitials) {
          comp.style.display = 'flex';
          hasVisible = true;
        } else {
          comp.style.display = 'none';
        }
      });
      category.style.display = hasVisible ? 'block' : 'none';
    });
  } catch (error) {
    displayError(`filterComponents error: ${error.message}`);
  }
}
