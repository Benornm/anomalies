import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './Input.css'

class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: (props.default || '')
        };
    }

    handleChange = (e) => {
        this.setState({value: e.target.value});
    }

    onSubmit = () => {
        const {min, max, step, type} = this.props;
        const value = Number(this.state.value)
        if(value >= (min) && value <= max && (value % step === 0) && value !== 0) {
            this.props.onSubmit(Number(value), type)
        } else {
            alert(`Value must be in range ${min || 0}-${max} with ${step} step between`)
        }
    }

    render() {
        const {label} = this.props;

        return (
            <form className='container'>
                <label className='label'>{label}</label>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <input
                        {...this.props}
                        className='input'
                        type='number'
                        value={this.state.value}
                        onChange={this.handleChange}
                    />
                    <div className='submit-button' onClick={this.onSubmit}>Submit</div>
                </div>
            </form>
        );
    }
}

Input.defaultProps = {
    min: 0,
    label: 'Enter text here'
};

Input.propTypes = {
    label: PropTypes.string,
    default: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    type: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    onSubmit: PropTypes.func,
};

export default Input;
