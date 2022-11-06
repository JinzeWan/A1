function init(){
    let location = window.location.href;
    let occurrences = 0;
    for(let key of location){
        if(key == "/"){
            occurrences ++;
        }
    }

    let location_keywords = location;
    for(let i = 0; i < (occurrences - 2); i++){
        let index = location_keywords.indexOf("\/");
        location_keywords = location_keywords.substring(index + 1, location_keywords.length);    
    }

	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
            let data = JSON.parse(req.responseText);
            let html = '';

            let index = location_keywords.lastIndexOf("\/");
            let keywords = location_keywords.substring(index + 1, location_keywords.length);                
            for (let i in data){
                let key_index1 = data[i]["URL"].lastIndexOf("-");
                let key_index2 = data[i]["URL"].lastIndexOf(".");  
                let key = data[i]["URL"].substring(key_index1 + 1, key_index2);              
                html += `<a href =  "/a1/fruit_page_information/${keywords}/${key}">${data[i]["URL"]}</a>&nbsp;&nbsp;&nbsp;Title: ${data[i]["title"]}&nbsp;&nbsp;&nbsp;Search Score: ${data[i]["score"]}<br>`
            }
            
            let list = document.getElementById("list_of_results");
            let div = document.createElement("div");
            div.innerHTML = html;
            list.appendChild(div);
		}
	};
  
	req.open("GET", `/a1/fruit/${location_keywords}`, true);
    //req.setRequestHeader("Content-type", "application/json");    
	req.send();
	    
}        