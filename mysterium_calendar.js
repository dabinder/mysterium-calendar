(function () {
	const UPDATE_FREQUENCY = 60; //update every minute
	const EVENT_CLASSES = {
		past: "past-event",
		current: "current-event",
		future: "future-event"
	};
	
	/**
	 * set class on event element to past/current/future, remove other classes as needed
	 * @param {WEBElement} element event element to update
	 * @param {string} state past/current/future state
	 */
	function setEventState(element, state) {
		let classList = element.classList;
		Object.values(EVENT_CLASSES).forEach(function (value) {
			if (value == state && !classList.contains(state)) {
				classList.add(value);
			} else if (value != state && classList.contains(state)) {
				classList.remove(value);
			}
		});
	}
	
	//update event states
	let updateEvents = function () {
		let now = Date.now();
		savedEvents.forEach(function (event) {
			let element = event.eventElement;
			if (now >= event.start) {
				if (now <= event.end) {
					setEventState(element, EVENT_CLASSES.current);
					if (!event.allDay) currentEvent = event;
				} else { //now > event.end
					setEventState(element, EVENT_CLASSES.past);
				}
			} else { //now < event.start
				setEventState(element, EVENT_CLASSES.future);
			}
		});
	}

	//scrape page for list of events
	let savedEvents = [];
	let currentEvent;
	document.addEventListener("DOMContentLoaded", function () {
		let calendar = document.getElementsByClassName("simcal-calendar")[0],
			offset = parseInt(calendar.dataset.offset),
			events = calendar.getElementsByClassName("simcal-event");

		for (let i = 0; i < events.length; i++) {
			let event = events[i],
				start, end, allDay;
			try {
				//convert UNIX seconds to JS milliseconds
				start = parseInt(event.getElementsByClassName("simcal-event-start")[0].dataset.eventStart) * 1000;
				end = parseInt(event.getElementsByClassName("simcal-event-end")[0].dataset.eventEnd) * 1000;
				allDay = false;
			} catch (ex) {
				//all-day events won't have start/end time - set to midnight based on Mysterium's timezone
				let day = new Date(parseInt(event.dataset.start) * 1000);
				day.setUTCHours(-offset / (60 * 60), 0, 0, 0);
				start = day.getTime();

				day.setUTCHours(day.getUTCHours() + 24);
				end = day.getTime();

				allDay = true;
			}

			savedEvents.push({
				eventElement: event.querySelector("div.simcal-event-details"),
				start: start,
				end: end,
				allDay: allDay
			});
		}
		
		//run initial update on page load
		updateEvents();
		
		//scroll to current event
		let currentLink = document.getElementById("currenteventlink");
		if (currentLink != null) {
			currentLink.addEventListener("click", function () {
				if (currentEvent != null) {
					currentEvent.eventElement.scrollIntoView(true);
				}
			}, false);
		}
		
		//timezone offset option
		let tzOffset = document.getElementById("tz_offset_selection"),
			eventTimes = document.querySelectorAll(".simcal-event-start-time, .simcal-event-end-time");
		
		try { //insurance in case someone's browser explodes
			if (tzOffset != null) {
				let tzSelector = document.createElement("select");
				for (i = -12; i <= 12; i++) {
					let opt = document.createElement("option");
					opt.value = i;
					opt.textContent = "UTC" + (i < 0 ? i : "+" + i);
					if (i == offset) opt.selected = true;
					tzSelector.appendChild(opt);
				}
				
				//create static text via JS so if for whatever reason the browser doesn't like it the selector won't even appear
				let selectionTxt = document.createElement("span");
				selectionTxt.textContent = "Select here to display times in a different timezone. Note this will only update times listed below; dates will not be updated.  ";
				tzOffset.appendChild(selectionTxt);
				tzOffset.appendChild(tzSelector);
				tzSelector.addEventListener("change", function (e) {
					eventTimes.forEach(function (eventTime) {
						let timeStr = eventTime.dataset.eventStart || eventTime.dataset.eventEnd;
						if (timeStr == undefined) return;
						let eventDate = new Date(parseInt(timeStr) * 1000);
						eventDate.setHours(eventDate.getUTCHours() + parseInt(this.value));
						let hours = eventDate.getHours();
						let ampm = hours >=12 ? 'pm' : 'am';
						hours = hours % 12;
						hours = hours ? hours : 12;
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

	//periodically run update
	setInterval(updateEvents, UPDATE_FREQUENCY * 1000);
})();