const sceneList = document.getElementById("sceneList");
const sceneDetails = document.getElementById("sceneDetails");
let scenes = [];

// 渲染场景清单
function renderSceneList() {
    sceneList.innerHTML = "";
    scenes.forEach(scene => {
        const li = document.createElement("li");
        li.textContent = scene.title;
        li.addEventListener("click", () => displayScene(scene));
        sceneList.appendChild(li);
    });
}

// 显示场景详情
function displayScene(scene) {
    document.getElementById("sceneTitle").textContent = scene.title;
    document.getElementById("sceneDescription").textContent = scene.description;

    const dialogDiv = document.getElementById("sceneDialog");
    dialogDiv.innerHTML = scene.dialog.map(d => `
        <p><strong>${d.speaker}:</strong> ${d.text} <br> <em>${d.romaji}</em></p>
    `).join("");

    const translationDiv = document.getElementById("sceneTranslation");
    translationDiv.innerHTML = scene.translation.map(t => `<p>${t}</p>`).join("");

    document.getElementById("saveSceneBtn").style.display = "none"; // 隐藏保存按钮
}

// 生成新场景
async function generateScene() {
    const userInput = document.getElementById("newSceneInput").value;
    if (!userInput) return alert("请输入新场景描述！");

    // 模拟调用 OpenAI 接口
    const newScene = {
        id: scenes.length + 1,
        title: "新场景",
        description: userInput,
        dialog: [
            { speaker: "A", text: "生成的对话句子1。", romaji: "Gensei no kaiwa bunshou 1." },
            { speaker: "B", text: "生成的对话句子2。", romaji: "Gensei no kaiwa bunshou 2." }
        ],
        translation: [
            "A: 生成的中文解释1。",
            "B: 生成的中文解释2。"
        ]
    };

    scenes.push(newScene);
    renderSceneList(); // 更新清单
    displayScene(newScene);
    document.getElementById("saveSceneBtn").style.display = "block";
}

// 初始化应用
async function init() {
    scenes = await loadJSON("data/scenes.json");
    renderSceneList();
}

// 事件绑定
document.getElementById("generateSceneBtn").addEventListener("click", generateScene);

// 加载场景
init();