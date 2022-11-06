let data = {};
// This array stores the data of selected pages
let custom_page_data_array = [];
let custom_page_count = 0;
let matrix;
let array = [];
let matrix2;
let alpha = 0.5;
// This array stores URL of pages those already visited
let visited = [];
let custom_page_matrix1;
let custom_page_matrix2;
let custom_page_array = [];

const {Matrix} = require("ml-matrix");
const Crawler = require("crawler");
const express = require('express');
const app = express();
const mc = require("mongodb").MongoClient;
const elasticlunr = require("elasticlunr");

const q = elasticlunr(function () {
    this.addField('body');
    this.setRef('URL');
});

function bubbleSort_text_query(arr) {
  var low = 0;
  var high= arr.length-1; 
  var tmp,j;

  while (low < high) {
      for (j= low; j< high; ++j)
          if (arr[j]["score"]> arr[j+1]["score"]) {
              tmp = arr[j]; arr[j]=arr[j+1];arr[j+1]=tmp;
          }
      --high;
      for (j=high; j>low; --j)
          if (arr[j]["score"]<arr[j-1]["score"]) {
              tmp = arr[j]; arr[j]=arr[j-1];arr[j-1]=tmp;
          }
      ++low;
  }
  return arr;
}

function count_substring(str, substr){
  var count;
  var reg = "/" +substr + "/gi";
  reg = eval(reg);
  if (str.match(reg) == null){
    count = 0;
  }
  else{
    count = str.match(reg).length;
  }
  return count;
}

function create_custom_page_matrix(){
  for(let i = 0; i < custom_page_data_array.length; i++){
    let arr = [];
    // If the corresponding page of a row has outgoing links
    // add the corresponding number to the corresponding position of the row, otherwise all 0
    let index_arr = [];
    for(let h = 0; h < custom_page_data_array.length; h++){
      if(custom_page_data_array[i]["links"].includes(custom_page_data_array[h]["sub_URL"])){
        index_arr.push(h);
        //arr.push(1/data[i]["links"].length);
      }
    }

    for(let h = 0; h < custom_page_data_array.length; h++){
      if(index_arr.includes(h)){
        arr.push(1/index_arr.length);
      }
      else{
        arr.push(0);
      }
    }

    // If the numbers in a row are all 0, replace them all with 1/alpha
    if(index_arr.length == 0 || !arr.includes(1/index_arr.length)){
      let arr = []
      for(let i = 0; i < 1000; i++){
        arr.push(0.001);
      }
      custom_page_array.push(arr)
      console.log("debug");
    }
    else{
      custom_page_array.push(arr);
    }
  }

  custom_page_matrix1 = new Matrix(custom_page_array);
}

function custom_page_create_matrix2(){
  let tmp_array = [];

  for(let i = 0; i < 1000; i++){
    let arr = [];
    for(let h = 0; h < 1000; h++){
      arr.push(0.001);
    }
    tmp_array.push(arr);
  }

  custom_page_matrix2 = new Matrix(tmp_array);
}


// create a martix which generate by the outgoing links
function create_matrix(){
  for(let i = 0; i < 1000; i++){
    let arr = [];
    // If the corresponding page of a row has outgoing links
    // add the corresponding number to the corresponding position of the row, otherwise all 0
    for(let h = 0; h < 1000; h++){
      if(data[i]["links"].includes(h)){
        // the denominator is 1/number of page's outgoing links
        arr.push(1/data[i]["links"].length);
      }
      else{
        arr.push(0);
      }
    }
    // If the numbers in a row are all 0, replace them all with 1/alpha
    if(!arr.includes(1/data[i]["links"].length)){
      let arr = []
      for(let i = 0; i < 1000; i++){
        arr.push(0.001);
      }
      array.push(arr)
      console.log("debug");
    }
    else{
      array.push(arr);
    }
  }

  matrix = new Matrix(array);
}

// create a martix which only contain 1/N
function create_matrix2(){
  let tmp_array = [];

  for(let i = 0; i < 1000; i++){
    let arr = [];
    for(let h = 0; h < 1000; h++){
      arr.push(0.001);
    }
    tmp_array.push(arr);
  }

  matrix2 = new Matrix(tmp_array);
}

//return the euclidean distance between two PageRank vector
function cauculate_euclidean_distance(x, y){
  let x_array = [];
  let y_array = [];
  for(let i = 0; i < 1000; i++){
    x_array.push(x.get(0, i));
    y_array.push(y.get(0, i));
  }

  let result = 0;
  for(let i = 0; i < 1000; i++){
    result += Math.pow(x_array[i] - y_array[i], 2);
  }
  result = Math.sqrt(result);

  return result;
}

// This function find the steady-state probability vector
function iteration(){
  // The first iteration
  i = 0;
  let tmp_x = x0;
  console.log("Iteration #" + i);
  console.log(x0);
  x0 = x0.mmul(matrix);
  i++;
  // The second and beyond iteration
  while(cauculate_euclidean_distance(x0, tmp_x) >= 0.0001){
    console.log("Iteration #" + i);
    console.log(x0);
    tmp_x = x0;
    x0 = x0.mmul(matrix);
    i++;
  }
  console.log("complete");
}

function get_pageRank_score(){
  for(let i = 0; i < 1000; i++){
    data[i]["PR score"] = x0.get(0, i);
  }
}

// This function find the steady-state probability vector
function custom_page_iteration(){
  // The first iteration
  i = 0;
  let tmp_x = c_x0;
  console.log("Iteration #" + i);
  console.log(c_x0);
  c_x0 = c_x0.mmul(custom_page_matrix1);
  i++;
  // The second and beyond iteration
  while(cauculate_euclidean_distance(c_x0, tmp_x) >= 0.0001){
    console.log("Iteration #" + i);
    console.log(c_x0);
    tmp_x = c_x0;
    c_x0 = c_x0.mmul(custom_page_matrix1);
    i++;
  }
  console.log("complete");
}

function custom_page_get_pageRank_score(){
  //console.log(c_x0);
  for(let i = 0; i < 1000; i++){
    custom_page_data_array[i]["PR score"] = c_x0.get(0, i);
    //console.log(custom_page_array[i]["PR score"]);
  }
}

// upload data from RAM to database
function upload_to_db(upload_data){
  let data_array = [];
  Object.keys(upload_data).forEach(key => {
    data_array.push(upload_data[key]);
  });

  mc.connect("mongodb://localhost:27017/", function(err, client) {
    if(err) throw err;
    console.log("Connected to database.");

    let db = client.db('a1');

    db.collection("pages").insertMany(data_array, function(err,result){
      if(err) throw err;

      console.log(result);

      client.close();
    });
});
}


function custom_page_upload_to_db(upload_data){

  mc.connect("mongodb://localhost:27017/", function(err, client) {
    if(err) throw err;
    console.log("Connected to database.");

    let db = client.db('a1');

    db.collection("custom_pages").insertMany(upload_data, function(err,result){
      if(err) throw err;

      console.log(result);

      client.close();
    });
});
}



const c1 = new Crawler({
  maxConnections : 10, //use this for parallel, rateLimit for individual
  //rateLimit: 1000,

  callback : function (error, res, done) {
      if(error){
          console.log(error);
      }else{
          let page_data = {};
          let $ = res.$;
          let links = $("a");
          let index1 = res.options.uri.lastIndexOf("-");
          let index2 = res.options.uri.lastIndexOf(".");
          // record the URI
          page_data["URL"] = res.options.uri;
          // record the title
          let title = $("title").text();
          page_data["title"] = title;         
          let data_links = [];
          // record page's outgoing links
          $(links).each(function(i, link){
            let link_index1 = $(link).attr('href').lastIndexOf("-");
            let link_index2 = $(link).attr('href').lastIndexOf(".");
            let link_ID = $(link).attr('href').substring(link_index1 + 1, link_index2);
            data_links.push(parseInt(link_ID));
          });
          page_data["links"] = data_links;
          page_data["body"] =  $("p").text().replace(/\n/g," ");
          data[res.options.uri.substring(index1 + 1, index2)] = page_data;
      }
      done();
  }
});

//Perhaps a useful event
//Triggered when the queue becomes empty
//There are some other events, check crawler docs
c1.on('drain',function(){
  console.log("Done.");
  create_matrix();
  create_matrix2();
  matrix.mul(1-alpha);
  matrix2.mul(alpha);
  matrix.add(matrix2);
  iteration();
  get_pageRank_score();
  upload_to_db(data);
});



const c2 = new Crawler({
  maxConnections : 10, //use this for parallel, rateLimit for individual
  //rateLimit: 100,

  // This will be called for each crawled page
  callback : function (error, res, done) {
      if(error){
          console.log(error);
      }else{
          let page = {};
          page["URL"] = res.options.uri;
          //console.log(res.options.uri+ " " + custom_page_data_array.length);
          let $ = res.$; //get cheerio data, see cheerio docs for info
          let links = $("a"); //get all links from page
          let index = res.options.uri.lastIndexOf("\/");
          page["sub_URL"] = res.options.uri.substring(index + 1, res.options.uri.length);
          page["title"] = $("title").text();
          page["links"] = [];
          page["body"] = $("div[class= col-xs-12]").text().replace(/\n/g," ");

          $(links).each(function(i, link){
            let str = $(link).attr('href');
            if(str != null && str.indexOf("Courses.cfm?") != -1){
              page["links"].push(str);
            }
            
            if(custom_page_count < 999 && str != null && str.indexOf("Courses.cfm?") != -1 && visited.includes(str) == false){
              visited.push(str);
              c2.queue(`https://www.westerncalendar.uwo.ca/${$(link).attr('href')}`);
              custom_page_count = custom_page_count + 1;
            }
          });        
          custom_page_data_array.push(page);
      }
      done();
  }
});

c2.on('drain',function(){
  console.log("Done.");
  console.log(custom_page_data_array.length);
  create_custom_page_matrix();
  custom_page_create_matrix2();
  custom_page_matrix1.mul(1-alpha);
  custom_page_matrix2.mul(alpha);
  custom_page_matrix1.add(custom_page_matrix2);
  custom_page_iteration();
  custom_page_get_pageRank_score();
  custom_page_upload_to_db(custom_page_data_array);
});


let tmp_x = [1];
for(let i = 0; i < 999; i++){
  tmp_x.push(0);
}
//Initial PageRank vector
let x0 = new Matrix([tmp_x]);
let c_x0 = new Matrix([tmp_x]);


for(let i = 0; i < 1000; i++){
  c1.queue(`https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-${i}.html`);  
}

c2.queue("https://www.westerncalendar.uwo.ca/Courses.cfm?SelectedCalendar=Live&ArchiveID=");


app.use(express.json());

app.get("/a1/", function(req, res, next){
  res.sendFile(__dirname + "/client/homePage.html");         
})

app.get("/a1/homePage.js", function(req, res, next){
  res.sendFile(__dirname + "/client/homePage.js"); 
})

app.get("/a1/page_information/:id", function(req, res, next){
  res.sendFile(__dirname + "/client/page_information.html");       
})

app.get("/a1/page_information.js", function(req, res, next){
  res.sendFile(__dirname + "/client/page_information.js");       
})

app.get("/a1/highest_rank_pages", function(req, res, next){
  res.sendFile(__dirname + "/client/highest_ranked_pages.html");       
})

app.get("/a1/highest_rank_pages.js", function(req, res, next){
  res.sendFile(__dirname + "/client/highest_ranked_pages.js");       
})

app.get("/a1/fruit_query_page/:bool/:result_number/:text", function(req, res, next){
  res.sendFile(__dirname + "/client/text_query.html");       
})

app.get("/a1/text_query.js", function(req, res, next){
  res.sendFile(__dirname + "/client/text_query.js");       
})

app.get("/a1/personal_query_page/:bool/:result_number/:text", function(req, res, next){
  res.sendFile(__dirname + "/client/personal_text_query.html");       
})

app.get("/a1/personal_text_query.js", function(req, res, next){
  res.sendFile(__dirname + "/client/personal_text_query.js");       
})

app.get("/a1/fruit_page_information/:text/:id", function(req, res, next){
  res.sendFile(__dirname + "/client/fruit_page_information.html");    
})

app.get("/a1/fruit_page_information.js", function(req, res, next){
  res.sendFile(__dirname + "/client/fruit_page_information.js");            
})

app.get("/a1/personal_page_information/:text/:id", function(req, res, next){
  res.sendFile(__dirname + "/client/personal_page_information.html");    
})

app.get("/a1/personal_page_information.js", function(req, res, next){
  res.sendFile(__dirname + "/client/personal_page_information.js");            
})

app.get("/a1/page/:id", function(req, res, next){
  let res_data = {};
  let id = req.params.id
  mc.connect("mongodb://localhost:27017/", function(err, client) {
      if(err) throw err;
      console.log("Connected to database.");

      let db = client.db('a1');  
      db.collection("pages").findOne({URL : `https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-${id}.html`}, function(err,result){
          if(err) throw err;
          console.log(result);

          res_data["URL"] = result["URL"];
          res_data["PR score"] = result["PR score"];
          res_data["links"] = result["links"];

          res.status(200).json(res_data);
          client.close();
      });
  });
})

app.get("/a1/fruit_page/:keyword/:id", function(req, res, next){
  let res_data = {};
  let keyword = req.params.keyword;
  let id = req.params.id
  console.log(id + " "+ keyword);
  let incoming_links = [];

  
  mc.connect("mongodb://localhost:27017/", function(err, client) {
    if(err) throw err;
    console.log("Connected to database.");

    let db = client.db('a1');
    db.collection("pages").find().toArray(function(err,result){
      if(err) throw err;
      for(let i = 0; i < result.length; i++){
        if(result[i]["links"].includes(parseInt(id)) == true){
          incoming_links.push(result[i]["URL"]);
        }
      }
      res_data["incoming_links"] = incoming_links;
      console.log(res_data["incoming_links"])
      for(let i = 0; i < result.length; i++){
        if(result[i]["URL"] == `https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-${id}.html`){
          res_data["URL"] = result[i]["URL"];
          res_data["PR score"] = result[i]["PR score"];
          res_data["links"] = result[i]["links"];
          res_data["occurrences"] = count_substring(result[i]["body"], keyword);          
        }
      }
      res.status(200).json(res_data);
      client.close();
    });
  });

})

app.get("/a1/personal_page/:keyword/:id", function(req, res, next){
  let res_data = {};
  let keyword = req.params.keyword;
  let index = req.url.lastIndexOf("\/");
  let id = req.url.substring(index + 1, req.url.length);
  let incoming_links = [];

  
  mc.connect("mongodb://localhost:27017/", function(err, client) {
    if(err) throw err;
    console.log("Connected to database.");

    let db = client.db('a1');
    db.collection("custom_pages").find().toArray(function(err,result){
      if(err) throw err;
      for(let i = 0; i < result.length; i++){
        if(result[i]["links"].includes(parseInt(id)) == true){
          incoming_links.push(result[i]["URL"]);
        }
      }
      res_data["incoming_links"] = incoming_links;
      console.log(res_data["incoming_links"])
      for(let i = 0; i < result.length; i++){
        if(result[i]["sub_URL"] == id){
          res_data["URL"] = result[i]["URL"];
          res_data["PR score"] = result[i]["PR score"];
          res_data["links"] = result[i]["links"];
          res_data["occurrences"] = count_substring(result[i]["body"], keyword);          
        }
      }
      res.status(200).json(res_data);
      client.close();
    });
  });

})


app.get("/a1/25_highest_ranked_pages", function(req, res, next){
  let res_data = {};

  mc.connect("mongodb://localhost:27017/", function(err, client) {
      if(err) throw err;
      console.log("Connected to database.");

      let db = client.db('a1');  
      db.collection("pages").find().sort({"PR score": -1}).toArray(function(err,result){
        if(err) throw err;
    
        console.log(result);
        for(let i = 0; i < 25; i++){
          res_data[i] = result[i];
        }
        res.status(200).json(res_data);
        client.close();
      });
  })
})

app.get("/a1/fruit/:bool/:result_number/:text", function(req, res, next){
  let arr = [];
  let data = {};
  let bool = req.params.bool;
  let result_number = req.params.result_number;      
  let text = req.params.text;

  mc.connect("mongodb://localhost:27017/", function(err, client) {
    if(err) throw err;
    console.log("Connected to database.");


    let db = client.db('a1');
    db.collection("pages").find().toArray(function(err,result){
        if(err) throw err;

        let queries = [text];

        for(let i = 0; i < result.length; i++){
            q.addDoc(result[i]);
        }

        queries.forEach(query =>{
            console.log(`Querying for ${query}:`);

            arr = q.search(query, {});
            console.log(arr);

            for(let i = 0; i < arr.length; i++){
              for(let h = 0; h < result.length; h++){
                if(arr[i]["ref"] == result[h]["URL"]){
                  if(bool == "true"){
                    arr[i]["score"] += result[h]["PR score"];
                  }
                  arr[i]["title"] = result[h]["title"];
                }
              }        
            }
            

            arr = bubbleSort_text_query(arr);
            if(arr.length != 0){
              for(let i = arr.length - result_number; i < arr.length; i++){
                  data[`${i}`] ={};
                  data[`${i}`]["URL"] = arr[i]["ref"];
                  data[`${i}`]["score"] = arr[i]["score"];
                  data[`${i}`]["title"] = arr[i]["title"];     
              }
            }
        })

        for(let i = 0; i < result.length; i++){
            q.removeDoc(result[i]);
        }

        res.status(200).json(data);
        client.close();
    });

});
})

app.get("/a1/personal/:bool/:result_number/:text", function(req, res, next){
  let arr = [];
  let data = {};
  let bool = req.params.bool;
  let result_number = req.params.result_number;      
  let text = req.params.text;

  mc.connect("mongodb://localhost:27017/", function(err, client) {
    if(err) throw err;
    console.log("Connected to database.");


    let db = client.db('a1');
    db.collection("custom_pages").find().toArray(function(err,result){
        if(err) throw err;

        let queries = [text];

        for(let i = 0; i < result.length; i++){
            q.addDoc(result[i]);
        }

        queries.forEach(query =>{
            console.log(`Querying for ${query}:`);

            arr = q.search(query, {});
            console.log(arr);

            for(let i = 0; i < arr.length; i++){
              for(let h = 0; h < result.length; h++){
                if(arr[i]["ref"] == result[h]["URL"]){
                  console.log(result[h]["PR score"]);
                  if(bool == "true"){
                    arr[i]["score"] += result[h]["PR score"];
                  }
                  arr[i]["title"] = result[h]["title"];
                  arr[i]["sub_URL"] = result[h]["sub_URL"];
                }
              }        
            }
            

            arr = bubbleSort_text_query(arr);
            if(arr.length != 0){
              for(let i = arr.length - result_number; i < arr.length; i++){
                  data[`${i}`] ={};
                  data[`${i}`]["URL"] = arr[i]["ref"];
                  data[`${i}`]["score"] = arr[i]["score"];
                  data[`${i}`]["title"] = arr[i]["title"];
                  data[`${i}`]["sub_URL"] = arr[i]["sub_URL"]     
              }
            }
        })

        for(let i = 0; i < result.length; i++){
            q.removeDoc(result[i]);
        }

        res.status(200).json(data);
        client.close();
    });

});
})

app.listen(3000);
console.log("Server listening at http://localhost:3000");