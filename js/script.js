function updatePlaceholder() {
  const type = document.getElementById('contentType').value;
  const codeType = document.getElementById('codeType').value;
  const input = document.getElementById('contentInput');

  if (codeType === 'QR') {
    input.placeholder = 'Enter content for QR code';
    return;
  }

  switch(type) {
    case 'text':
      input.placeholder = 'Enter any text';
      break;
    case 'url':
      input.placeholder = 'Enter a URL (e.g. https://example.com)';
      break;
    case 'email':
      input.placeholder = 'Enter an email address';
      break;
    case 'phone':
      input.placeholder = 'Enter a phone number';
      break;
    case 'numeric':
      input.placeholder = 'Enter numeric code only';
      break;
    default:
      input.placeholder = 'Enter content here';
  }
}

function generateCode() {
  const type = document.getElementById('contentType').value;
  const codeType = document.getElementById('codeType').value;
  let content = document.getElementById('contentInput').value.trim();

  if (!content) {
    alert('Please enter content to encode.');
    return;
  }

  // Validation for content types (except QR which can encode anything)
  if (codeType !== 'QR') {
    if (type === 'url') {
      if (!/^https?:\/\//i.test(content)) {
        content = 'http://' + content;
      }
    } else if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(content)) {
        alert('Please enter a valid email address.');
        return;
      }
    } else if (type === 'phone') {
      const phoneRegex = /^[+]?[\d]{7,15}$/;
      if (!phoneRegex.test(content)) {
        alert('Please enter a valid phone number (digits only, optional +).');
        return;
      }
    } else if (type === 'numeric') {
      if (!/^\d+$/.test(content)) {
        alert('Please enter numeric digits only.');
        return;
      }
    }
  }

  // Clear previous codes
  document.getElementById('barcode').style.display = 'none';
  document.getElementById('qrcode').style.display = 'none';

  if (codeType === 'QR') {
    // Generate QR code on canvas
    const canvas = document.getElementById('qrcode');
    QRCode.toCanvas(canvas, content, {
      color: {
        dark: '#bb86fc',
        light: '#121212'
      },
      width: 200,
      margin: 2
    }, function (error) {
      if (error) {
        alert('Error generating QR code: ' + error);
        return;
      }
      canvas.style.display = 'block';
      document.getElementById('downloadBtn').disabled = false;
    });
  } else {
    // Generate 1D barcode using JsBarcode
    try {
      JsBarcode('#barcode', content, {
        format: codeType,
        lineColor: '#bb86fc',
        width: 2,
        height: 100,
        displayValue: true,
        fontColor: '#e0e0e0'
      });
      document.getElementById('barcode').style.display = 'block';
      document.getElementById('downloadBtn').disabled = false;
    } catch (e) {
      alert('Error generating barcode: ' + e.message);
      document.getElementById('downloadBtn').disabled = true;
    }
  }
}

function downloadCode() {
  const codeType = document.getElementById('codeType').value;

  if (codeType === 'QR') {
    // Download QR code canvas as PNG
    const canvas = document.getElementById('qrcode');
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qrcode.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } else {
    // Download SVG barcode as PNG
    const svg = document.getElementById('barcode');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement('canvas');
    const bbox = svg.getBBox();
    canvas.width = bbox.width + 20;
    canvas.height = bbox.height + 40;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 10, 10);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'barcode.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = url;
  }
}

// Initialize placeholder on page load
updatePlaceholder();