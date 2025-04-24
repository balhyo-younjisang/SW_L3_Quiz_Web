document.addEventListener("DOMContentLoaded", async function () {
    correctText.textContent = `정답: ${currentStatus.correct} 개`;
    incorrectText.textContent = `오답: ${currentStatus.incorrect} 개`;

    hiddenText.classList.remove("hidden");

    quizList = await getRandomProblem();

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

    // 기존 이벤트 제거
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
        current.options.forEach((option, index) => {
            const li = document.createElement("li");
            li.textContent = option;
            li.dataset.index = index;
            li.addEventListener("click", function () {
                const isCorrect = parseInt(this.dataset.index) === current.answer;

                if (isCorrect) {
                    alert("정답입니다!");
                    currentStatus.correct++;
                    correctText.textContent = `정답: ${currentStatus.correct} 개`;
                } else {
                    alert("오답입니다!");
                    currentStatus.incorrect++;
                    incorrectText.textContent = `오답: ${currentStatus.incorrect} 개`;
                }

                answerWrap.textContent = current.options[current.answer];
                explain.textContent = current.explanation;

                document.querySelectorAll("#choices li").forEach(li => li.style.pointerEvents = "none");

                nextButton.classList.remove("hidden");
            });
            choices.appendChild(li);
        });
    }
}
