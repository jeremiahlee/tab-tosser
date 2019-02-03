export function formatPageTitle(str) {
    // Truncate if necessary
    if (str.length > 40) {
        str = str.trim().slice(0, 39).trim() + "…";
    }

    // Sanitize HTML characters 
    // http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
    let div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
