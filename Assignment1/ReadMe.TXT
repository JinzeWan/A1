Name: Jinze Wan
ID: 101168891

http://134.117.128.186:3000/a1

1. My web crawler starts with a "root site" and follows its outgoing links to other sites. The links are checked before going any further, and if the url does not contain the fragment I specified, no further access will be made to prevent visiting sites that are not the target. I calculate the PageRank of the page before uploading the data to the database. The collected data is first stored in RAM and then uniformly stored in the database.

2. I designed the server completely separated from the client, and designed the components interface according to the unified design principle. In addition, my server is completely stateless.

3. It computed by Elasticlunr, its scoring mechanism is combined by Boolean model, TF/IDF, and the vector space model. Elasticlunr checks if there is a corresponding term in the document based on the keyword, and then gets a score based on the corresponding score of each matching term

4. I create a N*N martix which generate by the outgoing links. If the corresponding page of a row has outgoing links, add the corresponding number (1/N) to the corresponding position of the row, otherwise all 0. Then replace all the digits in the row that are all 0 with 1/alpha. And then I generate another N*N matrix, where all the numbers are 1/N. The first matrix times (1-alpha), the second matrix times alpha. At last, the two matrix are added to obtain the adjacency matrix.

5. My web crawler selection policy is based on Breadth-first. The link of the current web page, if the web crawler has not obtained its information before, then the web crawler starts visiting it, otherwise, it should be skipped.

6. I chose the course website of western university. Because its url has a uniform suffix format, convenient to avoid visiting pages those don't want to visit. I found it difficult to store only the content of the web page I wanted as data. To solve this I analyzed the html code of the web page to find a solution by Store only div module with a specific name.

7. My search engine works well, and I could easily do more by adding code. What I think could be improved, in addition to further improving the identification of resources, is the optimization to avoid duplicate access.