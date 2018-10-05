export default class FatalErrorDisplayErrorDisplay {
	constructor(canHide = true) {
		this.canHide = canHide;
	}
	newElement(type="div", contentPairs=[], father) {
		let el = document.createElement(type);
		contentPairs.forEach(pair => el.setAttribute(pair[0], pair[1]));
		if (father) {
			father.appendChild(el);
		}
		return el;
	}
	show(error) {
		let wrapper = this.newElement("div", [
			["role", "dialog"],
			["style", `
			display: flex;
			align-items: center;
			justify-content: center;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 1300;
			position: fixed;`
			]]);
		let darken = this.newElement("div", [
			["style",
			`opacity: 1; will-change: opacity; transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: -1;
			position: fixed;
			touch-action: none;
			background-color: rgba(0, 0, 0, 0.5);
			-webkit-tap-highlight-color: transparent;
			`]], wrapper);
		let innerWrapper = this.newElement("div", [
			["style", `
			opacity: 1;
			will-change: opacity;
			transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
			max-width: 600px;
			flex: 0 1 auto;
			max-height: calc(100% - 96px);
			margin: 48px;
			display: flex;
			outline: none;
			position: relative;
			overflow-y: auto;
			flex-direction: column;
			box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12);
			border-radius: 4px;
			background-color: #fff;
			`]], wrapper);
		let titleWrapper = this.newElement("div", [
			["style", `
			flex: 0 0 auto;
			margin: 0;
			padding: 24px 24px 20px;
			`]], innerWrapper);
		let title = this.newElement("h2", [
			["style", `
				color: rgba(0, 0, 0, 0.87);
				font-size: 1.3125rem;
				font-weight: 500;
				font-family: "Roboto", "Helvetica", "Arial", sans-serif;
				line-height: 1.1667em;
				margin: 0;
				display: block;
				text-shadow: none;
			`]], titleWrapper);
		title.innerText = error.name;
		let paragraphWrapper = this.newElement("div", [
			["style", `
			flex: 1 1 auto;
			padding: 0 24px 24px;
			overflow-y: auto;
			`]], innerWrapper);
		let paragraph = this.newElement("pre", [
			["style", `
				color: rgba(0, 0, 0, 0.54);
				font-size: 1rem;
				font-weight: 400;
				font-family: "Roboto", "Helvetica", "Arial", sans-serif;
				line-height: 1.5em;
				margin: 0;
				display: block;
				text-shadow: none;
				cursor: text;
			`]], paragraphWrapper);
		let stack = error.stack.toString().substr(error.name.length+2);
		paragraph.innerText = stack;
		document.body.appendChild(wrapper);
	}
}

