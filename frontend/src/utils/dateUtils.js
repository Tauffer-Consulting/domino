export const stringIsDate = (date) => {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}


export const formatIsoDatetime = (dateString, dateSeparator = "-", useTime = true, useTimezone = true) => {
    var date = dateString.substring(0, 10).replace("-", dateSeparator);
    var time = dateString.substring(11, 19)
    var timezone = dateString.split("+")[1]

    var outputDate = date

    if (useTime) outputDate = `${outputDate} ${time}`
    if (useTimezone) outputDate = `${outputDate} ${timezone}`

    return outputDate

}

export const parseIsoDatetime = (dateString, dateSeparator = "-", useTime = true, useTimezone = true) => {
    var isDate = stringIsDate(dateString);
    if (!isDate) return isDate;

    return formatIsoDatetime(dateString, dateSeparator, useTime, useTimezone)
}

