const text = "Hai, ini balasan dari AI.";
const output = document.getElementById("output");

let i = 0;
const interval = setInterval(() => {
  if (i < text.length) {
    output.innerHTML += text[i];
    i++;
  } else {
    clearInterval(interval);
  }
}, 40);
