export const checkImage = (file) => {
    let err = ""
    if (!file) return err = "File does not exist."

    if (file.size > 1024 * 1024) // 1mb
        err = "The largest image size is 1mb."

    if (file.type !== 'image/jpeg' && file.type !== 'image/png')
        err = "Image format is incorrect."

    return err;
}


export const imageUpload = async (images) => {
    let imgArr = [];
    for (const item of images) {
        const formData = new FormData()
        console.log(item);
        if (item.camera) {
            formData.append("file", item.camera)
        } else {
            formData.append("file", item)
        }

        console.log(formData);

        formData.append("upload_preset", "qfpmvyxn")
        formData.append("cloud_name", "dkqimhvk8")
        console.log('***');
        console.log(formData);
        // https://cloudinary.com/console/c-e4e506ab5d5932144f54487dd00212/media_library/folders/c12310dc5c894021769a77d81e1a124915

        // https://res.cloudinary.com/dkqimhvk8/image/upload

        // https://api.cloudinary.com/v1_1/devat-channel/upload
        const res = await fetch("https://api.cloudinary.com/v1_1/dkqimhvk8/upload", {
            method: "POST",
            body: formData
        })

        console.log('//');
        console.log(res);
        const data = await res.json()
        imgArr.push({ public_id: data.public_id, url: data.url })
    }
    return imgArr;
}