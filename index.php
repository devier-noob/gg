<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Monitoring System</title>
    <link rel="stylesheet" href="style.css">
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

            <button id="zoomIn">Zoom +</button>
            <button id="zoomOut">Zoom -</button>

            <button id="saveImageSetup" class="btn">Lock</button>
            <button id="unlockImage" class="btn active" >Unlock</button>

            <button id="normalModeBtn" class="btn" >Add Pin</button>
            
            
            <button id="clearPin">Delete All Pins</button>

            <!-- ADDED: MULTI SELECT MODE -->
            <button id="selectModeBtn" class="btn">Select Pins</button>
            <button id="createReportBtn">Create Report</button>


        </div>

        <div id="viewer">

            <img id="mapImage" draggable="false">
            <div id="pinsLayer"></div>
            <div id="selectBox"></div>

        </div>

    </div>

    <!-- REPORT LIST -->
    <div id="reportPanel">
        <h3 style="position: fixed;background: white;width: 250px;padding: 10px 5px; top: 65px; display: flex;justify-content: space-between;">Reports<button id="clearHistory">Clear All</button></h3>
        
        <div id="reportList" style="margin-top:50px;"></div>
        
    </div>


</div>

<!-- PIN FORM -->
<div id="pinForm" class="hidden">

    <h3>Pin Details</h3>

    <input id="pinName" placeholder="Name">

    <select id="pinStatus">
        <option value="" place >Status</option>
        <option>Normal</option> 
        <option>Warning</option>
        <option>Critical</option>
        
    </select>

    <textarea id="pinDescription" placeholder="Description"></textarea>

    <button id="savePinBtn">Save</button>
    <button id="deletePinBtn">Delete</button>

</div>

<!-- REPORT FORM -->
<div id="reportForm" class="hidden">

    <h3>Create Report</h3>

    <input id="reportTitle" placeholder="Report Title">
    <textarea id="reportDesc" placeholder="Description"></textarea>

    <button id="saveReportBtn" type="button">Save Report</button>
    <button id="cancelReportBtn" type="button">Cancel</button>

    
    <div id="selectedPreview"></div>

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