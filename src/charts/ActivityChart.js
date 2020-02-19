import React, { PureComponent } from 'react';
import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Loading from "../components/Loader/Loader";
import {Anomaly, groupByParam, groupByTime, normalizeDataBetweenHours, sortHours} from "./funcs";

class ActivityChart extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            showHoursDiff:  null,
            checkMinutesDiff: null,
            data: null,
            groupByUserAndActivitiesTime: null,
            loading: true
        }
    }

    componentDidMount() {
        this.initData()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if((this.props.showHoursDiff !== prevProps.showHoursDiff) ||
            (this.props.checkMinutesDiff !== prevProps.checkMinutesDiff)) {
            this.setState({loading: true});
            this.initData()
        }
    }

    initData = () => {
        const {data, showHoursDiff, checkMinutesDiff} = this.props;
        // setTimeout - to mock fetch to get data...
        setTimeout(() => {
            // Get the data sorted by hours groups
            const normalizedData = sortHours(normalizeDataBetweenHours(data, showHoursDiff, checkMinutesDiff))
            // Get the data sorted by users and user's activities groups
            const groupByUser = groupByParam(data, 'user_email')
            const groupByUserAndActivitiesTime = Object.keys(groupByUser).reduce( (acc, userName) => {
                return {...acc, [userName]: groupByTime(groupByUser[userName], showHoursDiff, checkMinutesDiff)}
            }, {})

            this.setState({
                data: normalizedData,
                groupByUserAndActivitiesTime,
                loading: false,
                showHoursDiff:  showHoursDiff,
                checkMinutesDiff: checkMinutesDiff,
            });
        }, 1000)
    }

    getAnomalies = (activity, hourRange, maxUserActionsPerMinutes) => {
        const {groupByUserAndActivitiesTime} = this.state;
        let user = null
        const anomaly = Object.keys(activity).find(timeRange => {
            if (timeRange !== 'count') {
                const rangeActivities = activity[timeRange]
                // Find an anomaly in user's behavior within the time range
                return rangeActivities.find(act => {
                    if(groupByUserAndActivitiesTime[act.user_email][hourRange] &&
                        groupByUserAndActivitiesTime[act.user_email][hourRange][timeRange] &&
                        groupByUserAndActivitiesTime[act.user_email][hourRange][timeRange].length > maxUserActionsPerMinutes) {
                        user = act.user_email
                        return act
                    }
                    return false
                })
            }
            return false
        })
        return {anomalyFound: !!anomaly, user}
    }

    checkAnomaly = (activity, hourRange, maxUserActionsPerMinutes, lineName) => {
        const anomaly = this.getAnomalies(activity, hourRange, maxUserActionsPerMinutes)
        if(anomaly.anomalyFound) {
            return {error: `Anomaly in ${lineName}-By ${anomaly.user}`}
        }
        return false
    }

    renderDot = (dotData, activityName) => {
        const { cx, cy, payload } = dotData;
        const {hourRange} = payload

        // Each activity can be defined with different rules (depends on the spec)
        const rules = {
            'SEND_MESSAGE' : (activity) => this.checkAnomaly(activity, hourRange, 10, 'SEND_MESSAGE'),
            'DOWNLOAD_FILE' : (activity) => this.checkAnomaly(activity, hourRange, 10, 'DOWNLOAD_FILE'),
            'UPLOAD_FILE' : (activity) => this.checkAnomaly(activity, hourRange, 10, 'UPLOAD_FILE'),
            'CREATE_LEAD' : (activity) => this.checkAnomaly(activity, hourRange, 10, 'CREATE_LEAD'),
            'UPDATE_LEAD' : (activity) => this.checkAnomaly(activity, hourRange, 10, 'UPDATE_LEAD'),
        }

        const anomaly = payload[activityName] && rules[activityName](payload[activityName])
        if(anomaly) {
            return <Anomaly cx={cx} cy={cy} key={cy} error={anomaly.error}/>
        }
        return false
    }

    render() {
        const { data, loading } = this.state;

        if(loading)
            return <Loading/>

        const lines = [
            {name: 'SEND_MESSAGE', stroke: 'blue'},
            {name: 'CREATE_LEAD', stroke: 'black'},
            {name: 'UPDATE_LEAD', stroke: 'brown'},
            {name: 'DOWNLOAD_FILE', stroke: 'green'},
            {name: 'UPLOAD_FILE', stroke: 'orange'},
        ]

        return (
            <ResponsiveContainer width = '95%' height = {650} >
                <LineChart data={data} >
                    <XAxis dataKey="hourRange" height={50} dy={10}/>
                    <YAxis dx={-10} />
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Tooltip/>
                    <Legend />
                    {lines.map((line) => (
                        <Line
                            key={line.name}
                            type="monotone"
                            connectNulls
                            name={line.name}
                            dataKey={`${line.name}.count`}
                            stroke={line.stroke}
                            dot={(dotData) => this.renderDot(dotData, line.name)}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        );
    }
}

export default ActivityChart
