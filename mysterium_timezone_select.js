(function () {
	document.addEventListener("DOMContentLoaded", function () {
		//timezone offset option
		let calendar = document.getElementsByClassName("simcal-calendar")[0],
			offset = parseInt(calendar.dataset.offset) / (60 * 60),
			tzOffsetElt = document.getElementById("tz_offset_selection"),
			eventTimes = document.querySelectorAll(".simcal-event-start-time, .simcal-event-end-time");
		
		try { //insurance in case someone's browser explodes
			if (tzOffsetElt != null) {
				let tzSelector = document.createElement("select");
				for (i = -12; i <= 14; i++) {
					let opt = document.createElement("option");
					opt.value = i;
					opt.textContent = "UTC" + (i < 0 ? i : "+" + i);
					if (i == offset) opt.selected = true;
					tzSelector.appendChild(opt);
				}
				
				//create static text via JS so if for whatever reason the browser doesn't like it the selector won't even appear
				let selectionTxt = document.createElement("span"),
					textContent = "",
					localOffset = new Date().getTimezoneOffset();
				if (localOffset !== undefined) {
					localOffset /= -60;
					textContent = "Your timezone was detected as UTC" + (localOffset < 0 ? localOffset : "+" + localOffset) + ". ";
				}
				textContent += "Select here to change the displayed timezone: ";
				selectionTxt.textContent = textContent;
				tzOffsetElt.innerHTML = "";
				tzOffsetElt.appendChild(selectionTxt);
				tzOffsetElt.appendChild(tzSelector);
				selectionTxt = document.createElement("div");
				selectionTxt.textContent = "Note this will only update times listed below; dates will be always be based on UTC" + (offset < 0 ? offset : "+" + offset) + ".  ";
				tzOffsetElt.appendChild(selectionTxt);
				tzSelector.addEventListener("change", function () {
					eventTimes.forEach(function (eventTime) {
						let timeStr = eventTime.dataset.eventStart || eventTime.dataset.eventEnd;
						if (timeStr == undefined) return;
						let eventDate = new Date(parseInt(timeStr) * 1000);
						eventDate.setHours(eventDate.getUTCHours() + parseInt(this.value));
						let hours = eventDate.getHours();
						let ampm = hours >= 12 ? 'pm' : 'am';
						hours = (hours % 12) || 12; //replace 0 with 12
						let minutes = eventDate.getMinutes();
						minutes = minutes < 10 ? "0" + minutes : minutes;
						eventTime.textContent = hours + ':' + minutes + ' ' + ampm;
					}.bind(this));
				}, false);
			}
		} catch (ex) {
			//just stick with the default
		}
	}, false);
})();