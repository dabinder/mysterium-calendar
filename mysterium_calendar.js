(function () {
	const UPDATE_FREQUENCY = 60;
	const EVENT_CLASSES = {
		past: "past-event",
		current: "current-event",
		future: "future-event"
	};
	
	/**
	 * set class on event element to past/current/future, remove other classes as needed
	 * @param {WEBElement} element 
	 * @param {string} state 
	 */
	function setEventState(element, state) {
		let classList = element.classList;

		Object.keys(EVENT_CLASSES).forEach(function (key) {
			let className = EVENT_CLASSES[key];
			if (key == state && !classList.contains(className)) {
				classList.add(className);
			} else if (key != state && classList.contains(className)) {
				classList.remove(className);
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
					setEventState(element, "current");
					if (!event.allDay) currentEvent = event;
				} else { //now > event.end
					setEventState(element, "past");
				}
			} else { //now < event.start
				setEventState(element, "future");
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
	}, false);

	//periodically run update
	setInterval(updateEvents, UPDATE_FREQUENCY * 1000);
})();