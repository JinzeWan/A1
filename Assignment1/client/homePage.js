function query(){
    let id = document.getElementById("page_query").value;
    window.location.href=`/a1/page_information/${id}`;
}

function text_query_fruit(){
    let pageRank_bool = document.getElementById("yes").checked;
    let text = document.getElementById("text_query").value;
    let result_number = document.getElementById("result_number").value;

    if(text == ""){
        alert("Please enter some text");
        return;
    }
    else if(result_number < 1 || result_number > 50){
        alert("Please enter the number in the range");
        return;
    }

    if(pageRank_bool){
        window.location.href=`/a1/fruit_query_page/true/${result_number}/${text}`;  
    }
    else{
        window.location.href=`/a1/fruit_query_page/false/${result_number}/${text}`;          
    }
}

function text_query_personal(){
    let pageRank_bool = document.getElementById("yes").checked;
    let text = document.getElementById("text_query").value;
    let result_number = document.getElementById("result_number").value;

    if(text == ""){
        alert("Please enter some text");
        return;
    }
    else if(result_number < 1 || result_number > 50){
        alert("Please enter the number in the range");
        return;
    }

    if(pageRank_bool){
        window.location.href=`/a1/personal_query_page/true/${result_number}/${text}`;  
    }
    else{
        window.location.href=`/a1/personal_query_page/false/${result_number}/${text}`;          
    }
}

function text_query(){
    let type_bool = document.getElementById("fruit").checked;
    if(type_bool){
        text_query_fruit();        
    }
    else{
        text_query_personal();
    }
}