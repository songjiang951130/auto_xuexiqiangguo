requestScreenCapture(false);
sleep(2000);
// var img = captureScreen();
// images.save(img, "./image/mult.jpg");
var img = images.read("./image/mult.jpg");
var text = paddle.ocrText(img, 4, true);
log(text);
