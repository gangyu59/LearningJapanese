//js/app.js

let isSceneMode = true;
let words = [];
let scenes = [];
let selectedSceneId = null; 

const sceneList = document.getElementById("sceneList");
const sceneDetails = document.getElementById("sceneDetails");

const wordList = document.getElementById("wordList");
const wordDetails = document.getElementById("wordDetails");


document.getElementById("ToggleTitle").addEventListener("click", () => {
  isSceneMode = !isSceneMode;
  toggleMode(isSceneMode);
});

document.getElementById("ToggleWordTitle").addEventListener("click", () => {
  isSceneMode = true; // 切换回场景模式
  toggleMode(isSceneMode);
});

// utils.js

window.toggleMode = function(isSceneMode) {
  const toggleTitle = document.getElementById("ToggleTitle");
  const sceneElements = ["sceneDialog", "sceneTranslation", "sceneTitle", "sceneDescription", "sceneListContainer", "sceneDetails"];
  const wordElements = ["wordDialog", "wordTranslation", "wordTitle", "wordDescription", "wordListContainer", "wordDetails"];

  if (isSceneMode) {
    toggleTitle.textContent = "常用场景";
    if (typeof renderSceneList === "function") renderSceneList();
    sceneElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "block";
    });
    wordElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  } else {
    toggleTitle.textContent = "常用词汇";
    if (typeof renderWordList === "function") renderWordList();
    wordElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "block";
    });
    sceneElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }
};

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

// 渲染场景清单
function renderWordList() {
    wordList.innerHTML = "";
    words.forEach(word => {
        const li = document.createElement("li");
        li.textContent = word.title;
        li.dataset.id = word.id;
        li.classList.remove("selected");
        li.addEventListener("click", () => {
            selectedWordId = word.id;
            highlightSelectedWord(li);
            displayWord(word);
        });
        wordList.appendChild(li);
    });
}

// 高亮选中的场景标题
function highlightSelectedWord(selectedLi) {
    document.querySelectorAll("#wordList li").forEach(li => li.classList.remove("selected"));
    selectedLi.classList.add("selected");
}

// 朗读文本的功能
function logAvailableVoices() {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        console.warn("No voices available.");
        return;
    }

//    console.log("Available voices:", voices.map(v => ({
//        name: v.name,
//        lang: v.lang,
//        default: v.default,
//    })));
}

function playAudio(text, gender) {
    logAvailableVoices(); // 打印所有可用语音（调试用）

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP"; // 强制指定为日语

    const voices = window.speechSynthesis.getVoices();

    // 确保语音列表加载完成
    if (voices.length > 0) {
        // 优先选择日语 Kyoko 声音
        const voice = voices.find(v => v.name === "Kyoko" && v.lang === "ja-JP");
        if (voice) {
            utterance.voice = voice;
        } else {
            console.warn("Kyoko not found. Trying other Japanese voices.");
            // 如果没有找到 Kyoko，尝试选择其他日语语音
            const fallbackVoice = voices.find(v => v.lang === "ja-JP");
            if (fallbackVoice) {
                utterance.voice = fallbackVoice;
            } else {
                console.warn("No Japanese voice found. Falling back to default.");
            }
        }
    } else {
        console.error("Voice list is empty. Ensure voices are loaded.");
    }

    window.speechSynthesis.speak(utterance);
}

// 确保语音列表加载完成后执行
window.speechSynthesis.onvoiceschanged = () => {
    console.log("Voices updated.");
    logAvailableVoices();
};

// 显示选中的场景
function displayScene(scene) {
    document.getElementById("sceneTitle").textContent = scene.title;
    document.getElementById("sceneDescription").textContent = scene.description;

    const dialogDiv = document.getElementById("sceneDialog");
    dialogDiv.innerHTML = scene.dialog
        .map(
            (d, index) => `
        <div class="dialog-entry">
            <p><strong>${d.speaker}:</strong> ${d.text} <br> 
            <em>${d.romaji}</em> <br>
            <span>${scene.translation[index]}</span></p>
            <button class="play-audio" data-index="${index}" data-gender="${d.speaker === 'A' ? 'male' : 'female'}">
                🔊 朗读
            </button>
        </div>
        `
        )
        .join("");

    // 移除翻译框
    const translationDiv = document.getElementById("sceneTranslation");
    if (translationDiv) {
        translationDiv.style.display = "none"; // 隐藏翻译框
    }

    document.querySelectorAll(".play-audio").forEach(button => {
        button.addEventListener("click", event => {
            const index = event.target.getAttribute("data-index");
            const gender = event.target.getAttribute("data-gender");
            const text = scene.dialog[index].text;
            playAudio(text, gender);
        });
    });
}

// 显示选中的场景
function displayWord(word) {
    document.getElementById("wordTitle").textContent = word.title;
    document.getElementById("wordDescription").textContent = word.description;

    const dialogDiv = document.getElementById("wordDialog");
    dialogDiv.innerHTML = word.dialog
        .map(
            (d, index) => `
        <div class="dialog-entry">
            <p><strong>${d.speaker}:</strong> ${d.text} <br> 
            <em>${d.romaji}</em> <br>
            <span>${word.translation[index]}</span></p>
            <button class="play-audio" data-index="${index}" data-gender="${d.speaker === 'A' ? 'male' : 'female'}">
                🔊 朗读
            </button>
        </div>
        `
        )
        .join("");

    // 移除翻译框
    const translationDiv = document.getElementById("wordTranslation");
    if (translationDiv) {
        translationDiv.style.display = "none"; // 隐藏翻译框
    }

    document.querySelectorAll(".play-audio").forEach(button => {
        button.addEventListener("click", event => {
            const index = event.target.getAttribute("data-index");
            const gender = event.target.getAttribute("data-gender");
            const text = word.dialog[index].text;
            playAudio(text, gender);
        });
    });
}

// 确保语音列表加载完成后执行
window.speechSynthesis.onvoiceschanged = () => {
//    console.log("语音列表已加载。");
};

// 与 GPT 交互生成新场景
async function generateScene() {
    const descriptionInput = document.getElementById("newSceneDescription").value.trim();

    if (!descriptionInput) {
        alert("请输入新场景描述！");
        return;
    }

    // 显示加载提示
    const hourglass = document.getElementById('hourglass');
    const generateSceneBtn = document.getElementById('generateSceneBtn');
    hourglass.style.display = 'block';
    generateSceneBtn.disabled = true;

    // 构造 GPT 的 prompt
    const userMessage = `请根据以下描述生成一个日语对话，并为该场景生成一个最多不超过四个字的中文标题。返回的 JSON 格式应符合以下结构：
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
请直接返回 JSON 内容，不要添加解释文字或代码块。对话最多6句。
描述: ${descriptionInput}`;

    const messages = [
        { "role": "system", "content": "你是一个生成日语学习对话的助手。" },
        { "role": "user", "content": userMessage }
    ];

//    console.log("message =", messages);

    try {
        const response = await fetch('https://gpt4-111-us.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-01', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': 'mykey' // 替换为你的实际 API 密钥
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
            const cleanedContent = cleanGPTContent(rawContent);
            generatedScene = JSON.parse(cleanedContent);

            if (!validateSceneFormat(generatedScene)) {
                console.error("Invalid scene format received from GPT:", generatedScene);
                alert("生成的场景格式不正确！");
                return;
            }

            // 成功，显示生成的场景
            displayScene(generatedScene);
        } catch (error) {
            console.error("Error parsing or validating the scene:", error);
            alert("生成场景失败，返回的数据格式不正确！");
        }
    } catch (error) {
        console.error("生成场景失败：", error);
        alert("生成场景失败，请检查网络或 API 配置。");
    } finally {
        hourglass.style.display = 'none';
        generateSceneBtn.disabled = false;
    }
}

// 清理 GPT 返回内容，提取干净的 JSON
function cleanGPTContent(rawContent) {
    let content = rawContent.trim();

    // 如果包裹了 ```json``` 或 ```，去掉
    if (content.startsWith("```json")) {
        content = content.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (content.startsWith("```")) {
        content = content.replace(/^```/, "").replace(/```$/, "").trim();
    }

    // 如果 GPT 还在前面添加了 “以下是生成的内容：” 之类的，需要找第一个 { 开始
    const firstBraceIndex = content.indexOf('{');
    if (firstBraceIndex > 0) {
        content = content.slice(firstBraceIndex);
    }

    return content;
}

// 验证场景格式是否正确
function validateSceneFormat(scene) {
    if (!scene || typeof scene !== 'object') return false;
    if (typeof scene.title !== "string" || scene.title.trim() === "") return false;
    if (typeof scene.description !== "string" || scene.description.trim() === "") return false;
    if (!Array.isArray(scene.dialog) || scene.dialog.length === 0) return false;
    if (!scene.dialog.every(d => d.speaker && typeof d.speaker === "string" &&
                                  d.text && typeof d.text === "string" &&
                                  d.romaji && typeof d.romaji === "string")) {
        return false;
    }
    if (!Array.isArray(scene.translation) || scene.translation.length === 0) return false;

    return true;
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
    words = await loadJSON("data/words.json"); 
		
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
