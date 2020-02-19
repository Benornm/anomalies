import React from "react";
import moment from 'moment/min/moment-with-locales'

export const Anomaly = ({cx, cy, error}) => {
    const [user, msg] = error.split('-')
    return (
        <g x={cx - 20} y={cy - 15}>
            <text x={cx} y={cy - 25} fill="red" textAnchor="middle" alignmentBaseline="central" fontSize='14'>{msg}</text>
            <text x={cx} y={cy - 50} fill="red" textAnchor="middle" alignmentBaseline="central" fontSize='14'>{user}</text>
            <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red" viewBox="0 0 1024 1024">
                <path
                    d="M512 1009.984c-274.912 0-497.76-222.848-497.76-497.76s222.848-497.76 497.76-497.76c274.912 0 497.76 222.848 497.76 497.76s-222.848 497.76-497.76 497.76zM340.768 295.936c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM686.176 296.704c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM772.928 555.392c-18.752-8.864-40.928-0.576-49.632 18.528-40.224 88.576-120.256 143.552-208.832 143.552-85.952 0-164.864-52.64-205.952-137.376-9.184-18.912-31.648-26.592-50.08-17.28-18.464 9.408-21.216 21.472-15.936 32.64 52.8 111.424 155.232 186.784 269.76 186.784 117.984 0 217.12-70.944 269.76-186.784 8.672-19.136 9.568-31.2-9.12-40.096z"/>
            </svg>
        </g>
    );
}

export const normalizeDataBetweenHours = (data, showHoursDiff, checkMinutesDiff) => (
    data.reduce((acc, activity) => {
        const {activity_name} = activity
        const hoursRange = getTimeRange(activity, showHoursDiff, 'getHours')
        const minutesRange = getTimeRange(activity, checkMinutesDiff, 'getMinutes')

        // activityIndex - checks if we pushed this king of time range
        const activityIndex = acc.findIndex(activities => activities.hourRange === hoursRange)
        if(activityIndex > -1) {
            const activityObj = acc[activityIndex][activity_name]
            // activityObj - checks if we pushed this kind of activity already
            if(activityObj) {
                activityObj[minutesRange] ?
                    activityObj[minutesRange].push(activity) :
                    activityObj[minutesRange] = [activity]
                activityObj.count += 1
            } else {
                acc[activityIndex][activity_name] = {[minutesRange]: [activity]}
                acc[activityIndex][activity_name].count = 1
            }
        } else {
            acc.push({hourRange: hoursRange, [activity_name]: {[minutesRange] : [activity], count: 1}})
        }

        return acc
    }, [])
)

export const sortHours = (data) => (
    data.sort((a,b) => {
        const aRange = Number(a.hourRange.substr(0, a.hourRange.indexOf(':')))
        const bRange = Number(b.hourRange.substr(0, b.hourRange.indexOf(':')))
        return aRange - bRange
    })
)

const getLocaledTime = (date, timeDiff) => {
    const locale = window.navigator.userLanguage || window.navigator.language;
    moment.locale(locale);
    const localeDataFormat = moment.localeData().longDateFormat('LT');
    const from = moment(date).format(localeDataFormat)
    const to = moment(date).add(timeDiff, 'hours').format(localeDataFormat)
    return `${from}-${to}`;
}

export const getTimeRange = (activity, timeDiff, dateFunc) => {
    const date = new Date(`${activity.date} ${activity.time}`)
    const timeToInsert = parseInt(date[dateFunc]()/timeDiff) * timeDiff
    let timeRange = `${timeToInsert}:00 - ${timeToInsert + timeDiff}:00`
    if(dateFunc === 'getHours') {
        // Locale the time (shown in the chart)
        const newDate = new Date(`${activity.date} ${timeToInsert}:00:00`)
        timeRange = getLocaledTime(newDate, timeDiff)
    }
    return timeRange
}

export const groupByParam = (data, param) => (
    data.reduce((acc, activity) => {
            acc[activity[param]] ?
                acc[activity[param]].push(activity) :
                acc[activity[param]] = [activity]
            return acc;
        },
    {})
)

export const groupByTime = (data, showHoursDiff, checkMinutesDiff) => (
    data.reduce((acc, activity) => {
        const hoursRange = getTimeRange(activity, showHoursDiff, 'getHours')
        const minutesRange = getTimeRange(activity, checkMinutesDiff, 'getMinutes')
        if(acc[hoursRange]) {
            acc[hoursRange][minutesRange] ?
                acc[hoursRange][minutesRange].push(activity) :
                acc[hoursRange][minutesRange] = [activity]
        } else {
            acc[hoursRange] = {[minutesRange]: [activity]}
        }
        return acc;
    }, {})
)
