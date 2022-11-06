function init(){

    let location = window.location.href;
    let index = location.lastIndexOf("\/");
    let location_keywords = location.substring(index + 1, location.length);

	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
            let data = JSON.parse(req.responseText);
            let html = '';

            html += `URL: ${data["URL"]}<br>
            PR score: ${data["PR score"]}<br>
            This pages has these outgoing links:<br>`;
            for (let i = 0; i < data["links"].length; i++){
                html += `${data["links"][i]}</a><br>`
            }

            let list = document.getElementById("page_information");
            let div = document.createElement("div");
            div.innerHTML = html;
            list.appendChild(div);

		}
	};

	req.open("GET", `/a1/page/${location_keywords}`, true);
    //req.setRequestHeader("Content-type", "application/json");    
	req.send();
	    
}        