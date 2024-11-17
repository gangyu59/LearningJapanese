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

// 朗读文本的功能
function playAudio(text, gender) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // 根据性别选择适当的语音
    const voice = voices.find(v => {
        return v.lang === "ja-JP" && (gender === "male" ? v.name.includes("Google 日本語") : v.name.includes("女性"));
    });
    if (voice) {
        utterance.voice = voice;
    }

    utterance.lang = "ja-JP"; // 设置语言为日语
    window.speechSynthesis.speak(utterance);
}

// 修改 displayScene 函数
function displayScene(scene) {
    // 更新标题和描述
    document.getElementById("sceneTitle").textContent = scene.title;
    document.getElementById("sceneDescription").textContent = scene.description;

    // 生成对话部分
    const dialogDiv = document.getElementById("sceneDialog");
    dialogDiv.innerHTML = scene.dialog
        .map(
            (d, index) => `
        <div class="dialog-entry">
            <p><strong>${d.speaker}:</strong> ${d.text} <br> <em>${d.romaji}</em></p>
            <button class="play-audio" data-index="${index}" data-gender="${d.speaker === 'A' ? 'male' : 'female'}">
                🔊 朗读
            </button>
        </div>
        `
        )
        .join("");

    // 生成翻译部分
    const translationDiv = document.getElementById("sceneTranslation");
    translationDiv.innerHTML = `
        <h3>中文翻译</h3>
        ${scene.translation.map(t => `<p>${t}</p>`).join("")}
    `;

    // 给每个朗读按钮绑定点击事件
    document.querySelectorAll(".play-audio").forEach(button => {
        button.addEventListener("click", event => {
            const index = event.target.getAttribute("data-index");
            const gender = event.target.getAttribute("data-gender");
            const text = scene.dialog[index].text;
            playAudio(text, gender);
        });
    });
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