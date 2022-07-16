(function () {
	//this doesn't currently support all day events so if you need one of those then ¯\_(ツ)_/¯
	document.addEventListener("DOMContentLoaded", function () {
		//timezone offset option
		let tzOffsetElt = document.getElementById("tz_offset_selection"),
			eventTimes = document.querySelectorAll(".simcal-event-start-time, .simcal-event-end-time"),
			listContainer = document.getElementsByClassName("simcal-events-list-container")[0];

		try { //insurance in case someone's browser explodes
			if (tzOffsetElt != null) {
				//create static text via JS so if for whatever reason the browser doesn't like it the selector won't even appear
				let localOffset = new Date().getTimezoneOffset();
				if (localOffset === undefined) return;
				
				tzOffsetElt.innerHTML = "";

				localOffset /= -60;
				let tzNotice = document.createElement("div");
				tzNotice.textContent = "You can display this calendar in your local time for convenience. Your timezone was detected as UTC" + (localOffset < 0 ? localOffset : "+" + localOffset) + ". ";
				tzOffsetElt.appendChild(tzNotice);

				let selectionDiv = document.createElement("div");
				tzOffsetElt.appendChild(selectionDiv);
				let selectionText = document.createElement("span");
				selectionText.textContent = "Select here to change the displayed timezone: ";
				selectionDiv.appendChild(selectionText);
				
				let tzSelector = document.createElement("select");
				for (i = -12; i <= 14; i++) {
					let opt = document.createElement("option");
					opt.value = i;
					opt.textContent = "UTC" + (i < 0 ? i : "+" + i);
					if (i == localOffset) opt.selected = true;
					tzSelector.appendChild(opt);
				}
				selectionDiv.appendChild(tzSelector);
				
				tzSelector.addEventListener("change", function () {
					let newOffset = parseInt(this.value),
						dates = {},
						newListContainer = listContainer.cloneNode(false);
					eventTimes.forEach(function (eventTime) {
						let timeStr = eventTime.dataset.eventStart || eventTime.dataset.eventEnd;
						if (timeStr == undefined) return;
						let eventDate = new Date(parseInt(timeStr) * 1000);
						eventDate.setHours(eventDate.getHours() - localOffset + newOffset);
						let hours = eventDate.getHours(),
							ampm = hours >= 12 ? 'pm' : 'am';
						hours = (hours % 12) || 12; //replace 0 with 12
						let minutes = eventDate.getMinutes();
						minutes = minutes < 10 ? "0" + minutes : minutes;
						eventTime.textContent = hours + ':' + minutes + ' ' + ampm;
						let dateString = eventDate.toLocaleDateString('en-US', {
							weekday: 'long',
							day: 'numeric',
							month: 'long'
						});
						if (eventTime.classList.contains("simcal-event-start")) {
							if (!dates.hasOwnProperty(dateString)) {
								let dateHeaderDt = document.createElement("dt");
								dateHeaderDt.className = "simcal-day-label";
								newListContainer.appendChild(dateHeaderDt);
								//wordpress apparently has trouble understanding the concept of CSS so this is all inline
								dateHeaderDt.style.borderBottom = "1px solid black";
								let dateHeaderSpan = document.createElement("span");
								dateHeaderSpan.className = "simcal-day-label";
								dateHeaderSpan.style.backgroundColor = "black";
								dateHeaderSpan.style.color = "white";
								dateHeaderDt.appendChild(dateHeaderSpan);
								let dateHeaderLabel = document.createElement("span");
								dateHeaderLabel.className = "simcal-date-format";
								dateHeaderLabel.dataset.dateFormat = "l, F j";
								dateHeaderLabel.textContent = dateString;
								dateHeaderSpan.appendChild(dateHeaderLabel);

								let dd = document.createElement("dd");
								dd.className = "simcal-day simcal-day-has-events";
								dd.dataset.eventsCount = 0;
								newListContainer.appendChild(dd);
								let ul = document.createElement("ul");
								ul.className = "simcal-events";
								dd.appendChild(ul);

								dates[dateString] = {
									header: dateHeaderDt,
									eventSet: dd,
									eventsList: ul
								};
							}

							let li = eventTime.closest("li");
							dates[dateString].eventsList.appendChild(li);
							dates[dateString].eventSet.dataset.eventsCount++;
						}
					}.bind(this));
					listContainer.parentNode.replaceChild(newListContainer, listContainer);
					listContainer = newListContainer;
				}, false);
				
				tzSelector.dispatchEvent(new Event('change'));
			}
		} catch (ex) {
			//just stick with the default
		}
	}, false);
})();