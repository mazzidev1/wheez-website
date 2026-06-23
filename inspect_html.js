import fs from 'fs';

const text = fs.readFileSync('fetch_result.txt', 'utf8');

console.log('Total length of HTML:', text.length);
console.log('Starts with:', text.substring(0, 300));
console.log('Ends with:', text.substring(text.length - 300));

// Let's count some key words or tags
const words = ['svg', 'path', 'logo', 'Wheez', 'image', 'Mlogo', 'viewBox', 'd=', 'https://', 'm_6a396cd420c081918438ce0cd954b6c5'];
const counts = {};
words.forEach(w => {
  const matches = text.match(new RegExp(w, 'gi'));
  counts[w] = matches ? matches.length : 0;
});
console.log('Word occurrences:', counts);

// Let's see some script ids
const scriptsWithId = [];
const scriptIdRegex = /<script\b[^>]*\bid=["']([^"']+)["']/gi;
let m;
while ((m = scriptIdRegex.exec(text)) !== null) {
  scriptsWithId.push(m[1]);
}
console.log('Scripts with IDs:', scriptsWithId);

// Let's print out what any script content has if it contains "json" or custom data
const remixRegex = /window\.__remixContext\s*=\s*/g;
if (text.match(remixRegex)) {
  console.log('Found __remixContext!');
}
