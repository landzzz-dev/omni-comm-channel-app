const FileName = (fileUrl) => {
    try {
        const url = new URL(fileUrl);
        return decodeURIComponent(url.pathname.split("/").pop()); // Extract and decode filename
    } catch (error) {
        console.error("Invalid URL: ", error);
        return null;
    }
};

const IsImage = (fileUrl) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
    const extension = fileUrl.split(".").pop().toLowerCase();
    return imageExtensions.includes(extension);
};


const DownloadFile = async (fileUrl) => {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to download file");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Create a temporary <a> element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = fileUrl.split("/").pop(); // Extract filename from URL
        document.body.appendChild(a);
        a.click();

        // Cleanup
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error("Download error:", error);
    }
};


export {
    DownloadFile,
    FileName,
    IsImage
}