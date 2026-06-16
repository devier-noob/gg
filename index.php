<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monitoring System</title>
    <link rel="stylesheet" type="text/css" href="style.css">    
</head>

<body>

<header>
    <h2>Monitoring System</h2>
    <span id="imageStatus">Editing</span>
</header>


<div class="main">
    

    <div class="viewer-panel">


        <div id="myDIV" class="toolbar">

                    <input type="file" id="imageUpload">
                    <button id="saveImageSetup" class="btn">Lock</button>
                    <button id="unlockImage" class="btn active" >Unlock</button>
                    <button id="normalModeBtn" class="btn" >Add Pin</button>            
                    <button id="clearPin">Delete All Pins</button>
                    <button id="selectModeBtn" class="btn">Select Pins</button>
                    <button id="createReportBtn">View All Pins</button> 
        </div>
        <div class="zoom">
            <button id="zoomIn" style="background-color: lightgray; color: black;" >🔍︎+</button>
            <button id="zoomOut" style="background-color: lightgray; color: black;">🔍︎-</button>
        </div>
                
        <div id="viewer">
                
                    
                <img id="mapImage" draggable="false">
                <div id="pinsLayer"></div>
                 <div id="selectBox"></div>

        </div>
        
        

        

    </div>
    <div class="forms">
        <div id="pinForm" class="hidden" >

                <h3>Pin Details</h3>

                <input id="pinName" placeholder="Name">

                <select id="pinStatus"  >
                    <option value="">Status</option>
                    <option>Normal</option> 
                    <option>Warning</option>
                    <option>Critical</option>
                    
                </select>
                <button id="eventDrop" style="display: flex;justify-content: space-between; border: 1px solid lightgray; background: white;color: black; " ><p>Events</p> <p>⮟</p></button>
                <div id="pinEvent" class="hidden">
                    
                    <button type="button" class="eventBtn" value="Event1">Event1</button>
                    <button type="button" class="eventBtn" value="Event2">Event2</button>
                    <button type="button" class="eventBtn" value="Event3">Event3</button>
                    <button type="button" class="eventBtn" value="Event4">Event4</button>
                    <button type="button" class="eventBtn" value="Event5">Event5</button>
                    <button type="button" class="eventBtn" value="Event6">Event6</button>
                    <button type="button" class="eventBtn" value="Event7">Event7</button>
                    <button type="button" class="eventBtn" value="Event8">Event8</button>
                    

                    



                </div>
                <h5>Event Logs</h5>
                <div id="pinEventLogs">
                    
                    <div id="eventLogs"></div>
                </div>

                <textarea id="pinDescription" placeholder="Description"></textarea>
                <div style="display: flex;flex-direction: row;justify-content: center;gap: 10px;">
                    <button id="savePinBtn">Save</button>
                    <button id="deletePinBtn">Delete</button>
                </div> 

        </div>
        
    </div>
    


</div>

<div id="reportPanel">
                <h3 style="display: flex; justify-content: space-between;">Activity Logs<button id="clearHistory" style="font-size: 20px; padding: 5px 10px; " >🗑</button></h3>
                
                <div id="reportList"></div>
                
</div>

<!-- REPORT FORM -->
<div id="reportForm" class="hidden">

    <div style="display: flex; justify-content: space-between;position:fixed;padding: 15px 10px;border-top-left-radius:10px;border-top-right-radius:10px; margin-top: -68px;margin-left: -14px; width:260px; background: white;">
        <h3>Pin Manager</h3>
        <button id="cancelReportBtn" type="button" style="padding: 5px; margin-top: -3px; margin-left:80px;background: white;color: #1f2937;size: 10px;" >✖</button>
    </div>
    
    <div id="pinContainerList"></div>

    

</div>
<script>
// Add active class to the current button (highlight it)
var header = document.getElementById("myDIV");
var btns = header.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
  var current = document.getElementsByClassName("active");
  current[0].className = current[0].className.replace(" active", "");
  this.className += " active";
  });
}
</script>

<script src="script.js"></script>

</body>
</html>
