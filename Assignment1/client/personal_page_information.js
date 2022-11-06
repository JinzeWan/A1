function init(){
    let location = window.location.href;
    let occurrences = 0;
    for(let key of location){
        if(key == "/"){
            occurrences ++;
        }
    }

    let location_keywords = location;
    for(let i = 0; i < (occurrences - 1); i++){
        let index = location_keywords.indexOf("\/");
        location_keywords = location_keywords.substring(index + 1, location_keywords.length);    
    }

	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
            let data = JSON.parse(req.responseText);
            let html = '';

            html += `URL: ${data["URL"]}<br>
            PR score: ${data["PR score"]}<br>
            Occurrences: ${data["occurrences"]}<br>
            This pages has these outgoing links:<br>`;
            for (let i = 0; i < data["links"].length; i++){
                html += `https://www.westerncalendar.uwo.ca/${data["links"][i]}</a><br>`
            }
            html += `<br>This page has these incoming links:<br>`;
            for (let i = 0; i < data["incoming_links"].length; i++){
                html += `${data["incoming_links"][i]}<br>`;
            }
            let list = document.getElementById("page_information");
            let div = document.createElement("div");
            div.innerHTML = html;
            list.appendChild(div);

		}
	};
    alert(location_keywords);
	req.open("GET", `/a1/personal_page/${location_keywords}`, true);
    //req.setRequestHeader("Content-type", "application/json");    
	req.send();
	    
}        