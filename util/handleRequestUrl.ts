const BASEURL = process.env.BASE_URL

const handleRequestUrl = (contentType:"eemodiaeArticle" |"eemodiae" | string = "eemodiae") => `${BASEURL}&content_type=${contentType}`

export default handleRequestUrl