export const siteSettingsQuery = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  companyName,
  subtitle,
  phone,
  email,
  city,
  domain,
  heroTitle,
  heroText,
  logo
}`

export const servicesQuery = `*[_type == "service" && isVisible == true] | order(order asc){
  _id,
  title,
  text,
  image
}`

export const productsQuery = `*[_type == "product" && isVisible == true] | order(order asc){
  _id,
  title,
  text
}`

export const tasksQuery = `*[_type == "taskItem" && isVisible == true] | order(order asc){
  _id,
  title
}`

export const articlesQuery = `*[_type == "article" && isVisible == true] | order(order asc){
  _id,
  title
}`

export const pageSectionsQuery = `*[_type == "pageSection" && isVisible == true] | order(order asc){
  _id,
  title,
  sectionKey,
  order,
  isVisible
}`
