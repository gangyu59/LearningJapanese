const sceneList = document.getElementById("sceneList");
const sceneDetails = document.getElementById("sceneDetails");
let scenes = [];
let selectedSceneId = null; // 用于存储当前选中的场景 ID

// 渲染场景清单
function renderSceneList() {
    sceneList.innerHTML = "";
    scenes.forEach(scene => {
        const li = document.createElement("li");
        li.textContent = scene.title;
        li.dataset.id = scene.id;
        li.classList.remove("selected");
        li.addEventListener("click", () => {
            selectedSceneId = scene.id;
            highlightSelectedScene(li);
            displayScene(scene);
        });
        sceneList.appendChild(li);
    });
}

// 高亮选中的场景标题
function highlightSelectedScene(selectedLi) {
    document.querySelectorAll("#sceneList li").forEach(li => li.classList.remove("selected"));
    selectedLi.classList.add("selected");
}

// 朗读文本的功能
function playAudio(text, gender) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => {
        return v.lang === "ja-JP" && (gender === "male" ? v.name.includes("Google 日本語") : v.name.includes("女性"));
    });
    if (voice) utterance.voice = voice;
    utterance.lang = "ja-JP";
    window.speechSynthesis.speak(utterance);
}

// 显示选中的场景
function displayScene(scene) {
    document.getElementById("sceneTitle").textContent = scene.title;
    document.getElementById("sceneDescription").textContent = scene.description;

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

    const translationDiv = document.getElementById("sceneTranslation");
    translationDiv.innerHTML = `
        <h3>中文翻译</h3>
        ${scene.translation.map(t => `<p>${t}</p>`).join("")}
    `;

    document.querySelectorAll(".play-audio").forEach(button => {
        button.addEventListener("click", event => {
            const index = event.target.getAttribute("data-index");
            const gender = event.target.getAttribute("data-gender");
            const text = scene.dialog[index].text;
            playAudio(text, gender);
        });
    });
}

// 验证场景格式
function validateSceneFormat(scene) {
    return (
        scene &&
        typeof scene.title === "string" &&
        typeof scene.description === "string" &&
        Array.isArray(scene.dialog) &&
        scene.dialog.every(d => d.speaker && d.text && d.romaji) &&
        Array.isArray(scene.translation)
    );
}

// 与 GPT 交互生成新场景
async function generateScene() {
    const titleInput = document.getElementById("newSceneTitle").value.trim();
    const descriptionInput = document.getElementById("newSceneDescription").value.trim();

    if (!titleInput || !descriptionInput) {
        alert("请输入新场景标题和描述！");
        return;
    }

    // 显示加载提示
    const hourglass = document.getElementById('hourglass');
    const generateSceneBtn = document.getElementById('generateSceneBtn');
    hourglass.style.display = 'block';
    generateSceneBtn.disabled = true;

    // 构造 GPT 的 prompt
    const userMessage = `请根据以下信息生成一个日语对话，返回的 JSON 格式应符合以下结构：
{
    "id": 1,
    "title": "场景标题",
    "description": "场景描述",
    "dialog": [
        { "speaker": "A", "text": "对话文本1", "romaji": "罗马音1" },
        { "speaker": "B", "text": "对话文本2", "romaji": "罗马音2" }
    ],
    "translation": [
        "A: 中文翻译1",
        "B: 中文翻译2"
    ]
}
对话最多 6 句。
标题: ${titleInput}
描述: ${descriptionInput}`;

    const messages = [
        { "role": "system", "content": "你是一个生成日语学习对话的助手。" },
        { "role": "user", "content": userMessage }
    ];

    try {
        const response = await fetch('https://gpt4-111-us.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-01', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': '84fba46b577b46f58832ef36527e41d4' // 替换为您的实际 API 密钥
            },
            body: JSON.stringify({
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            console.error("Error fetching data from GPT:", response.status, response.statusText);
            throw new Error('Error fetching data from OpenAI');
        }

        const data = await response.json();
        const rawContent = data.choices[0].message.content;

        let generatedScene;
        try {
            // 清理返回的字符串内容
            const cleanedContent = rawContent
                .trim() // 去除首尾空格
                .replace(/^[\s\n]*|[\s\n]*$/g, ""); // 清理多余换行

            // 尝试解析 JSON
            generatedScene = JSON.parse(cleanedContent);

            // 验证格式是否符合要求
            if (!validateSceneFormat(generatedScene)) {
                console.error("Invalid scene format received from GPT:", generatedScene);
                alert("生成的场景格式不正确！");
                return;
            }

            // 显示生成的场景
            displayScene(generatedScene);
        } catch (error) {
            console.error("Error parsing or validating the scene:", error);
            alert("生成场景失败，返回的数据格式不正确！");
        }
    } catch (error) {
        console.error("生成场景失败：", error);
        alert("生成场景失败，请检查网络或 API 配置。");
    } finally {
        // 隐藏加载提示并启用按钮
        hourglass.style.display = 'none';
        generateSceneBtn.disabled = false;
    }
}

// 验证场景格式的函数
function validateSceneFormat(scene) {
    return (
        scene &&
        typeof scene.title === "string" &&
        typeof scene.description === "string" &&
        Array.isArray(scene.dialog) &&
        scene.dialog.every(d => d.speaker && d.text && d.romaji) &&
        Array.isArray(scene.translation)
    );
}

// 添加新场景到 JSON 数据中
function addScene() {
    const titleInput = document.getElementById("newSceneTitle").value.trim();
    const descriptionInput = document.getElementById("newSceneDescription").value.trim();

    if (!titleInput || !descriptionInput) {
        alert("请输入新场景标题和描述！");
        return;
    }

    const newScene = {
        id: scenes.length + 1,
        title: titleInput,
        description: descriptionInput,
        dialog: [
            { speaker: "A", text: "你好，这是一段生成的对话。", romaji: "Konnichiwa, kore wa seisei sareta kaiwa desu." },
            { speaker: "B", text: "是的，这是第二句对话。", romaji: "Hai, kore wa dainikaiwa desu." }
        ],
        translation: [
            "A: 你好，这是一段生成的对话。",
            "B: 是的，这是第二句对话。"
        ]
    };

    scenes.push(newScene);
    renderSceneList();
    alert("新场景已添加！");
}

// 删除选中的场景
function deleteScene() {
    if (selectedSceneId === null) {
        alert("请选择要删除的场景！");
        return;
    }

    scenes = scenes.filter(scene => scene.id !== selectedSceneId);
    selectedSceneId = null;
    renderSceneList();
    document.getElementById("sceneDialog").innerHTML = "";
    document.getElementById("sceneTranslation").innerHTML = "";
    document.getElementById("sceneTitle").textContent = "对话";
    document.getElementById("sceneDescription").textContent = "场景描述";
    alert("场景已删除！");
}

// 初始化应用
async function init() {
    scenes = await loadJSON("data/scenes.json");
    renderSceneList();
}

// 事件绑定
document.getElementById("generateSceneBtn").addEventListener("click", generateScene);
//document.getElementById("addSceneBtn").addEventListener("click", addScene);
//document.getElementById("deleteSceneBtn").addEventListener("click", deleteScene);

// 确保触摸事件不被阻止
document.addEventListener("DOMContentLoaded", () => {
    const sceneDetails = document.getElementById("sceneDetails");
    const sceneListContainer = document.getElementById("sceneListContainer");

    sceneDetails.addEventListener("touchstart", e => e.stopPropagation(), { passive: false });
    sceneListContainer.addEventListener("touchstart", e => e.stopPropagation(), { passive: false });
});

// 加载场景
init();