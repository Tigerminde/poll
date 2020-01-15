class poll {
	id = 0;
	data = {
		title: "",
		answers: []
	};

	constructor(pollElement, id = 0) {
		this.id = id;
		this.setPollElement(pollElement);
	}

	setPollElement(value) {
		if (value) {
			this._pollElement = value;
		} else {
			this._pollElement = document.createElement("div");
			this._pollElement.classList.add("poll");
		}
		this.setTitleElement(this._pollElement.querySelector("#poll__title"));
		this.setAnswersElement(this._pollElement.querySelector("#poll__answers"));
		return this._pollElement;
	}

	setTitleElement(value) {
		if (value) {
			this._titleElement = value;
		} else {
			this._titleElement = document.createElement("div");
			this._titleElement.classList.add("poll__title");
			this._titleElement["id"] = "poll__title";
		}
		this.data.title = this._titleElement.textContent;
		return this._titleElement;
	}

	setAnswersElement(value) {
		this.data.answers.length = 0;
		if (value) {
			this._answersElement = value;
			Array.from(value.children).forEach(child => {
				this.answers.push(child.textContent);
			});
		} else {
			this._answersElement = document.createElement("div");
			this._answersElement.classList.add("poll__answers poll__answers_active");
			this._answersElement["id"] = "poll__answers";
		}
		return this._answersElement;
	}

	render() {
		this._titleElement.textContent = this.data.title;
		this._answersElement.innerHTML = "";
		for (let i = 0; i < this.data.answers.length; i++) {
			let button = document.createElement("button");
			button.classList.add("poll__answer");
			button["answerid"] = i;
			button.textContent = this.data.answers[i];
			this._answersElement.append(button);
		}
		Array.from(this._answersElement.children).forEach(child => {
			child.addEventListener("click", e => {
				this._pollElement.dispatchEvent(
					new CustomEvent("answer-click", {
						detail: {
							answerID: child["answerid"]
						},
						bubbles: true,
						cancelable: true
					})
				);
			});
		});
	}
}

let xhr = new XMLHttpRequest();
xhr.addEventListener("loadend", function () {
	let pollFromRequest = new poll(document.getElementsByClassName("poll")[0]);
	pollFromRequest.id = this.response["id"];
	pollFromRequest.data = this.response["data"];
	pollFromRequest.render();

	document.addEventListener("answer-click", e => {
		let postxhr = new XMLHttpRequest();
		postxhr.addEventListener("loadend", function () {
			let response = this.response;
			let sum = 0;
			for (let i = 0; i < pollFromRequest.data.answers.length; i++) {
				sum += Number(response.stat[i].votes);
			}
			let statString = ``;
			for (let i = 0; i < pollFromRequest.data.answers.length; i++) {
				if (i != 0) statString += `\n`;
				statString += `${pollFromRequest.data.answers[i]} - ${
          Math.floor(Number(response.stat[i].votes) * 100 / sum)
        }%`;
			}
			alert(
				`Спасибо, ваш голос "${
          pollFromRequest.data.answers[e.detail.answerID]
        }" засчитан!\n\nРезультаты опроса:\n${statString}`
			);

		});
		postxhr.responseType = "json";
		postxhr.open("POST", "https://netology-slow-rest.herokuapp.com/poll.php");
		postxhr.setRequestHeader(
			"Content-type",
			"application/x-www-form-urlencoded"
		);
		postxhr.send(`vote=${pollFromRequest.id}&answer=${e.detail.answerID}`);
	});
});
xhr.responseType = "json";
xhr.open("get", "https://netology-slow-rest.herokuapp.com/poll.php");
xhr.send();
