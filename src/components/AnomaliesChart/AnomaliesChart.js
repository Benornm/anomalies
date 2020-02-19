import React, {Component} from 'react';
import PropTypes from "prop-types";
import './AnomaliesChart.css'
import mock_activity from "../../data/mock_activity";
import ActivityChart from "../../charts/ActivityChart";
import Input from "../Input/Input";

class AnomaliesChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showHoursDiff: 1,
            checkMinutesDiff: 5
        }
    }

    onInputSubmit = (value, type) => {
        this.setState({[type]: value});
    }

    render() {
        const {showHoursDiff, checkMinutesDiff} = this.state;

        return (
            <div className='anomalies-chart-container'>
                <div style={{width: '20%'}}>
                    <Input
                        label={'Hours range to show'}
                        min={1}
                        max={3}
                        step={1}
                        default={showHoursDiff}
                        type={'showHoursDiff'}
                        onSubmit={this.onInputSubmit}
                    />
                    <Input
                        label={'Minutes range to check'}
                        max={60}
                        step={5}
                        default={checkMinutesDiff}
                        type={'checkMinutesDiff'}
                        onSubmit={this.onInputSubmit}
                    />
                </div>

                <ActivityChart data={mock_activity} showHoursDiff={showHoursDiff} checkMinutesDiff={checkMinutesDiff}/>
            </div>
        );
    }
}

Input.propTypes = {
    showHoursDiff: PropTypes.number,
    checkMinutesDiff: PropTypes.number,
};

export default AnomaliesChart;
