const quizContainer = document.getElementById("quiz-container");
const correctText = document.getElementById("correct");
const incorrectText = document.getElementById("incorrect");
const nextButton = document.getElementById("next-button");
const newProblemButton = document.getElementById("new-button");
const hiddenText = document.getElementById("loading");
const question = document.getElementById("question");
const choices = document.getElementById("choices");
const answerWrap = document.getElementById("answer");
const explain = document.getElementById("explain");
const answerInput = document.getElementById("answer-input");
let answerButton = document.getElementById("submit");
let quizList = [];

let currentProblemIndex = 0;
let currentStatus = {
    "correct": 0,
    "incorrect": 0
}

async function getRandomProblem() {
    const response = await fetch("https://api.yunjisang.me:8889/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        console.error("Error fetching quiz:", response.statusText);
        return;
    }
    const data = await response.json();

    return data;
}

function displayProblem() {
    nextButton.classList.add("hidden");
    answerInput.classList.add("hidden");
    answerButton.classList.add("hidden");
    choices.innerHTML = "";
    answerWrap.textContent = "";
    explain.textContent = "";

    const current = quizList[currentProblemIndex];
    question.textContent = current.question;

    // 기존 이벤트 제거 및 새로 설정
    const newAnswerButton = answerButton.cloneNode(true);
    answerButton.parentNode.replaceChild(newAnswerButton, answerButton);

    if (current.type === "단답형") {
        answerInput.classList.remove("hidden");
        newAnswerButton.classList.remove("hidden");

        newAnswerButton.addEventListener("click", () => {
            const userAnswer = answerInput.value.trim();
            const correctAnswer = current.answer.trim();

            if (userAnswer === correctAnswer) {
                alert("정답입니다!");
                currentStatus.correct++;
                correctText.textContent = `정답: ${currentStatus.correct} 개`;
            } else {
                alert(`오답입니다! 정답은 "${correctAnswer}"입니다.`);
                currentStatus.incorrect++;
                incorrectText.textContent = `오답: ${currentStatus.incorrect} 개`;
            }

            answerWrap.textContent = correctAnswer;
            explain.textContent = current.explanation;
            answerInput.classList.add("hidden");
            newAnswerButton.classList.add("hidden");
            nextButton.classList.remove("hidden");
        });
    } else {
        // OX 또는 객관식 문제 처리
        current.options.forEach((option, index) => {
            const li = document.createElement("li");
            li.textContent = option;
            li.dataset.index = index;

            li.addEventListener("click", function () {
                let isCorrect;

                // OX 문제일 경우
                if (current.options.includes("O") && current.options.includes("X")) {
                    isCorrect = option === current.answer; // answer는 "O" 또는 "X" 문자열
                } else {
                    // 일반 객관식
                    isCorrect = parseInt(this.dataset.index) === current.answer;
                }

                if (isCorrect) {
                    alert("정답입니다!");
                    currentStatus.correct++;
                    correctText.textContent = `정답: ${currentStatus.correct} 개`;
                } else {
                    alert("오답입니다!");
                    currentStatus.incorrect++;
                    incorrectText.textContent = `오답: ${currentStatus.incorrect} 개`;
                }

                answerWrap.textContent = current.options[current.answer] || current.answer;
                explain.textContent = current.explanation;

                document.querySelectorAll("#choices li").forEach(li => li.style.pointerEvents = "none");
                nextButton.classList.remove("hidden");
            });

            choices.appendChild(li);
        });
    }
}



document.addEventListener("DOMContentLoaded", async function () {
    correctText.textContent = `정답: ${currentStatus.correct} 개`;
    incorrectText.textContent = `오답: ${currentStatus.incorrect} 개`;

    hiddenText.classList.remove("hidden");

    quizList = await getRandomProblem();
    console.log(quizList);

    if (!quizList || quizList.length === 0 || quizList.error) {
        quizContainer.textContent = "문제 생성에 실패했어요. 잠시 후 새로고침해주세요.";
        newProblemButton.classList.remove("hidden");
    } else {
        hiddenText.classList.add("hidden");
        displayProblem();
    }

    nextButton.addEventListener("click", function () {
        if (currentProblemIndex < quizList.length - 1) {
            currentProblemIndex++;
            displayProblem();
        } else {
            quizContainer.textContent = "모든 문제를 풀었습니다!";
            nextButton.classList.add("hidden");
        }
    });
});

async function getRandomProblem() {
    const response = await fetch("https://api.yunjisang.me:8889/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            section: ""  // 빈 문자열로 임의 문제 요청
        })
    });

    if (!response.ok) {
        console.error("Error fetching quiz:", response.statusText);
        return;
    }

    return await response.json();
}

function displayProblem() {
    nextButton.classList.add("hidden");
    answerInput.classList.add("hidden");
    answerButton.classList.add("hidden");
    choices.innerHTML = "";
    answerWrap.textContent = "";
    explain.textContent = "";

    const current = quizList[currentProblemIndex];
    question.textContent = current.question;
    
    // 단답형 문제 처리 
    if (current.type === "정의 암기") {
        answerInput.classList.remove("hidden");
        answerButton.classList.remove("hidden");

        // 기존 이벤트 제거 후 새로 추가 (중복 방지)
        const newAnswerButton = answerButton.cloneNode(true);
        answerButton.replaceWith(newAnswerButton);

        newAnswerButton.addEventListener("click", () => {
            const userAnswer = answerInput.value.trim();
            const correctAnswer = current.answer.trim();

            if (userAnswer === correctAnswer) {
                alert("정답입니다!");
                currentStatus.correct++;
                correctText.textContent = `정답: ${currentStatus.correct} 개`;
            } else {
                alert(`오답입니다! 정답은 "${correctAnswer}"입니다.`);
                currentStatus.incorrect++;
                incorrectText.textContent = `오답: ${currentStatus.incorrect} 개`;
            }

            answerWrap.textContent = correctAnswer;
            explain.textContent = current.explanation;
            answerInput.classList.add("hidden");
            newAnswerButton.classList.add("hidden");
            nextButton.classList.remove("hidden");
        });

        // 버튼 교체 후 다시 참조 업데이트
        answerButton = newAnswerButton;
    } else {
        current.options.forEach((option, index) => {
            const li = document.createElement("li");
            li.textContent = option;
            li.dataset.index = index;

            li.addEventListener("click", function () {
                let isCorrect;
                if (current.options.includes("O") && current.options.includes("X")) {
                    isCorrect = option === current.answer;
                } else {
                    isCorrect = parseInt(this.dataset.index) === current.answer;
                }

                if (isCorrect) {
                    alert("정답입니다!");
                    currentStatus.correct++;
                    correctText.textContent = `정답: ${currentStatus.correct} 개`;
                } else {
                    alert("오답입니다!");
                    currentStatus.incorrect++;
                    incorrectText.textContent = `오답: ${currentStatus.incorrect} 개`;
                }

                answerWrap.textContent = current.options[current.answer] || current.answer;
                explain.textContent = current.explanation;

                document.querySelectorAll("#choices li").forEach(li => li.style.pointerEvents = "none");
                nextButton.classList.remove("hidden");
            });

            choices.appendChild(li);
        });
    }
}
