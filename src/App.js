import React, { useRef, useState } from "react";
import "./App.css";

function App() {
  const uploadRef = useRef();
  const origCanvasRef = useRef();
  const procCanvasRef = useRef();
  const [pixelInfo, setPixelInfo] = useState("Hover over image to see pixel data");

  const handleUpload = (e) => {
    const file = e.target.files[0];
    const ctx = origCanvasRef.current.getContext("2d");
    const img = new Image();
    img.onload = () => {
      origCanvasRef.current.width = img.width;
      origCanvasRef.current.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = URL.createObjectURL(file);
  };

  const applySmoothing = () => {
    const size = parseInt(document.getElementById("neighborhoodSize").value);
    const grayscale = document.getElementById("grayscale").checked;
    const offset = Math.floor(size / 2);

    const canvas = origCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (grayscale) {
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
      }
    }

    const output = new ImageData(canvas.width, canvas.height);
    const outData = output.data;

    for (let y = offset; y < canvas.height - offset; y++) {
      for (let x = offset; x < canvas.width - offset; x++) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = -offset; dy <= offset; dy++) {
          for (let dx = -offset; dx <= offset; dx++) {
            const i = ((y + dy) * canvas.width + (x + dx)) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        const idx = (y * canvas.width + x) * 4;
        outData[idx] = r / count;
        outData[idx + 1] = g / count;
        outData[idx + 2] = b / count;
        outData[idx + 3] = data[idx + 3];
      }
    }

    const procCanvas = procCanvasRef.current;
    procCanvas.width = canvas.width;
    procCanvas.height = canvas.height;
    procCanvas.getContext("2d").putImageData(output, 0, 0);
  };

  const handleMouseMove = (e) => {
    const canvas = origCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && y >= 0 && x < canvas.width && y < canvas.height) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      setPixelInfo(`(${x}, ${y}) – R: ${pixel[0]}, G: ${pixel[1]}, B: ${pixel[2]}, A: ${pixel[3]}`);
    }
  };

  return (
    <div className="App">
      <h2>Think41 Image Smoothing Tool</h2>
      <input type="file" accept="image/*" onChange={handleUpload} ref={uploadRef} />
      <br /><br />
      <label>Neighborhood Size: </label>
      <select id="neighborhoodSize">
        <option value="3">3x3</option>
        <option value="5">5x5</option>
        <option value="7">7x7</option>
      </select>
      <label>
        <input type="checkbox" id="grayscale" /> Convert to Grayscale First
      </label>
      <br /><br />
      <button onClick={applySmoothing}>Apply Smoothing</button>
      <br /><br />
      <div className="canvas-container">
  <canvas ref={origCanvasRef} onMouseMove={handleMouseMove} />
  <canvas ref={procCanvasRef} />
</div>

      <p style={{ fontFamily: "monospace" }}>{pixelInfo}</p>
    </div>
  );
}

export default App;
