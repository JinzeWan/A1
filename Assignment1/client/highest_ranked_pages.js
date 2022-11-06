function init(){
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
            let data = JSON.parse(req.responseText);
            let html = '';

            let i = 1;
            for (let i in data){
                html += `#${i} (${data[i]["PR score"]}) ${data[i]["URL"]}<br>`
                i++;
            }

            let list = document.getElementById("list_of_pages");
            let div = document.createElement("div");
            div.innerHTML = html;
            list.appendChild(div);
		}
	};

	req.open("GET", "/a1/25_highest_ranked_pages", true);
    //req.setRequestHeader("Content-type", "application/json");    
	req.send();
	    
}        