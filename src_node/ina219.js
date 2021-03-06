/*!
 * @file ina219.js
 *
 * Javascript library for INA219 DC Current sensor 
 *
 * @author Nicolas Cuadrado 
 *
 * ISC license
 *
 */

"use strict";

/**************************************************************************/
/*! 
    @brief  default I2C address
*/
/**************************************************************************/

const INA219_ADDRESS = 0x40;    // 1000000 (A0+A1=GND)

/**************************************************************************/
/*! 
    @brief  read
*/
/**************************************************************************/

const INA219_READ = 0x01;

/*=========================================================================
    CONFIG REGISTER (R/W)
    -----------------------------------------------------------------------*/

/**************************************************************************/
/*! 
    @brief  config register address
*/
/**************************************************************************/
const INA219_REG_CONFIG = 0x00;
    /*---------------------------------------------------------------------*/

/**************************************************************************/
/*! 
    @brief  reset bit
*/
/**************************************************************************/

const INA219_CONFIG_RESET = 0x8000;  // Reset Bit

/**************************************************************************/
/*! 
    @brief  mask for bus voltage range
*/
/**************************************************************************/

const INA219_CONFIG_BVOLTAGERANGE_MASK = 0x2000;  // Bus Voltage Range Mask

/**************************************************************************/
/*! 
    @brief  bus voltage range values
*/
/**************************************************************************/

const voltage_ranges = {
	INA219_CONFIG_BVOLTAGERANGE_16V : 0x0000,  // 0-16V Range
    INA219_CONFIG_BVOLTAGERANGE_32V : 0x2000  // 0-32V Range
};

/**************************************************************************/
/*! 
    @brief  mask for gain bits
*/
/**************************************************************************/

const INA219_CONFIG_GAIN_MASK = 0x1800;  // Gain Mask

/**************************************************************************/
/*! 
    @brief  values for gain bits
*/
/**************************************************************************/

const gain_bits = {
    INA219_CONFIG_GAIN_1_40MV : 0x0000,  // Gain 1, 40mV Range
    INA219_CONFIG_GAIN_2_80MV : 0x0800,  // Gain 2, 80mV Range
    INA219_CONFIG_GAIN_4_160MV : 0x1000,  // Gain 4, 160mV Range
    INA219_CONFIG_GAIN_8_320MV: 0x1800  // Gain 8, 320mV Range
};
	
/**************************************************************************/
/*! 
    @brief  mask for bus ADC resolution bits
*/
/**************************************************************************/
    
const INA219_CONFIG_BADCRES_MASK = 0x0780;  // Bus ADC Resolution Mask

/**************************************************************************/
/*! 
    @brief  values for bus ADC resolution
*/
/**************************************************************************/

const values_adc_resolution= {
    INA219_CONFIG_BADCRES_9BIT  : 0x0000,  // 9-bit bus res = 0..511
    INA219_CONFIG_BADCRES_10BIT : 0x0080,  // 10-bit bus res = 0..1023
    INA219_CONFIG_BADCRES_11BIT : 0x0100,  // 11-bit bus res = 0..2047
    INA219_CONFIG_BADCRES_12BIT : 0x0180  // 12-bit bus res = 0..4097
};

/**************************************************************************/
/*! 
    @brief  mask for shunt ADC resolution bits
*/
/**************************************************************************/  

const INA219_CONFIG_SADCRES_MASK = 0x0078;  // Shunt ADC Resolution and Averaging Mask

/**************************************************************************/
/*! 
    @brief  values for shunt ADC resolution
*/
/**************************************************************************/

const values_shunt_resolution = {
    INA219_CONFIG_SADCRES_9BIT_1S_84US : 0x0000,  // 1 x 9-bit shunt sample
    INA219_CONFIG_SADCRES_10BIT_1S_148US : 0x0008,  // 1 x 10-bit shunt sample
    INA219_CONFIG_SADCRES_11BIT_1S_276US : 0x0010,  // 1 x 11-bit shunt sample
    INA219_CONFIG_SADCRES_12BIT_1S_532US : 0x0018,  // 1 x 12-bit shunt sample
    INA219_CONFIG_SADCRES_12BIT_2S_1060US : 0x0048,	 // 2 x 12-bit shunt samples averaged together
    INA219_CONFIG_SADCRES_12BIT_4S_2130US : 0x0050,  // 4 x 12-bit shunt samples averaged together
    INA219_CONFIG_SADCRES_12BIT_8S_4260US : 0x0058,  // 8 x 12-bit shunt samples averaged together
    INA219_CONFIG_SADCRES_12BIT_16S_8510US : 0x0060,  // 16 x 12-bit shunt samples averaged together
    INA219_CONFIG_SADCRES_12BIT_32S_17MS : 0x0068,  // 32 x 12-bit shunt samples averaged together
    INA219_CONFIG_SADCRES_12BIT_64S_34MS : 0x0070,  // 64 x 12-bit shunt samples averaged together
    INA219_CONFIG_SADCRES_12BIT_128S_69MS : 0x0078  // 128 x 12-bit shunt samples averaged together
};

/**************************************************************************/
/*! 
    @brief  mask for operating mode bits
*/
/**************************************************************************/
    
const INA219_CONFIG_MODE_MASK = 0x0007;  // Operating Mode Mask

/**************************************************************************/
/*! 
    @brief  values for operating mode
*/
/**************************************************************************/

const values_operating_mode = {

    INA219_CONFIG_MODE_POWERDOWN : 0x0000,
    INA219_CONFIG_MODE_SVOLT_TRIGGERED : 0x0001,
    INA219_CONFIG_MODE_BVOLT_TRIGGERED : 0x0002,
    INA219_CONFIG_MODE_SANDBVOLT_TRIGGERED : 0x0003,
    INA219_CONFIG_MODE_ADCOFF : 0x0004,
    INA219_CONFIG_MODE_SVOLT_CONTINUOUS : 0x0005,
    INA219_CONFIG_MODE_BVOLT_CONTINUOUS : 0x0006,
    INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS : 0x0007	

};

/*=========================================================================*/

/**************************************************************************/
/*! 
    @brief  shunt voltage register
*/
/**************************************************************************/
const INA219_REG_SHUNTVOLTAGE = 0x01;
/*=========================================================================*/

/**************************************************************************/
/*! 
    @brief  bus voltage register
*/
/**************************************************************************/
const INA219_REG_BUSVOLTAGE = 0x02;
/*=========================================================================*/

/**************************************************************************/
/*! 
    @brief  power register
*/
/**************************************************************************/
const INA219_REG_POWER = 0x03;
/*=========================================================================*/

/**************************************************************************/
/*! 
    @brief  current register
*/
/**************************************************************************/
const INA219_REG_CURRENT = 0x04;
/*=========================================================================*/

/**************************************************************************/
/*! 
    @brief  calibration register
*/
/**************************************************************************/
const INA219_REG_CALIBRATION = 0x05;
/*=========================================================================*/

/**************************************************************************/
/*! 
    @brief  General use methods
*/
/**************************************************************************/


function formatToHex(number){
	
  var x = number.toString(16)
  
  return x.length == 1 ? '0x0'+x : '0x'+x
    
}

/**************************************************************************/
/*! 
    @brief  Class that stores state and functions for interacting with INA219 current/power monitor IC
*/
/**************************************************************************/


class Adafruit_INA219 {

	constructor(device_address){
		
		// Attributes
	
		this.ina219_calValue = 0;

		// The following multipliers are used to convert raw current and power
		// values to mA and mW, taking into account the current config settings

		this.ina219_currentDivider_mA = 0;
		this.ina219_powerMultiplier_mW = 0;
		
		// Devide address if using multiple devices
		
		this.device_address = device_address;

		// Measurable variables
		
		this.shuntvoltageraw = 0;
		this.busvoltageraw = 0;
		this.currentraw = 0;
		this.powerraw = 0;

	};
 
	// Method definition


	setCalibration_32V_2A(){

		// By default we use a pretty huge range for the input voltage,
		// which probably isn't the most appropriate choice for system
		// that don't use a lot of power.  But all of the calculations
		// are shown below if you want to change the settings.  You will
		// also need to change any relevant register settings, such as
		// setting the VBUS_MAX to 16V instead of 32V, etc.

		// VBUS_MAX = 32V             (Assumes 32V, can also be set to 16V)
		// VSHUNT_MAX = 0.32          (Assumes Gain 8, 320mV, can also be 0.16, 0.08, 0.04)
		// RSHUNT = 0.1               (Resistor value in ohms)

		// 1. Determine max possible current
		// MaxPossible_I = VSHUNT_MAX / RSHUNT
		// MaxPossible_I = 3.2A

		// 2. Determine max expected current
		// MaxExpected_I = 2.0A

		// 3. Calculate possible range of LSBs (Min = 15-bit, Max = 12-bit)
		// MinimumLSB = MaxExpected_I/32767
		// MinimumLSB = 0.000061              (61uA per bit)
		// MaximumLSB = MaxExpected_I/4096
		// MaximumLSB = 0,000488              (488uA per bit)

		// 4. Choose an LSB between the min and max values
		//    (Preferrably a roundish number close to MinLSB)
		// CurrentLSB = 0.0001 (100uA per bit)

		// 5. Compute the calibration register
		// Cal = trunc (0.04096 / (Current_LSB * RSHUNT))
		// Cal = 4096 (0x1000)

		this.ina219_calValue = 4096;

		// 6. Calculate the power LSB
		// PowerLSB = 20 * CurrentLSB
		// PowerLSB = 0.002 (2mW per bit)

		// 7. Compute the maximum current and shunt voltage values before overflow
		//
		// Max_Current = Current_LSB * 32767
		// Max_Current = 3.2767A before overflow
		//
		// If Max_Current > Max_Possible_I then
		//    Max_Current_Before_Overflow = MaxPossible_I
		// Else
		//    Max_Current_Before_Overflow = Max_Current
		// End If
		//
		// Max_ShuntVoltage = Max_Current_Before_Overflow * RSHUNT
		// Max_ShuntVoltage = 0.32V
		//
		// If Max_ShuntVoltage >= VSHUNT_MAX
		//    Max_ShuntVoltage_Before_Overflow = VSHUNT_MAX
		// Else
		//    Max_ShuntVoltage_Before_Overflow = Max_ShuntVoltage
		// End If

		// 8. Compute the Maximum Power
		// MaximumPower = Max_Current_Before_Overflow * VBUS_MAX
		// MaximumPower = 3.2 * 32V
		// MaximumPower = 102.4W

		// Set multipliers to convert raw current/power values
		this.ina219_currentDivider_mA = 10;  // Current LSB = 100uA per bit (1000/100 = 10)
		this.ina219_powerMultiplier_mW = 2;     // Power LSB = 1mW per bit (2/1)

		// Set Calibration register to 'Cal' calculated above	
		this.wireWriteRegister(INA219_REG_CALIBRATION, ina219_calValue);

		// Set Config register to take into account the settings above
		var config =	voltage_ranges.INA219_CONFIG_BVOLTAGERANGE_32V |
                	gain_bits.INA219_CONFIG_GAIN_8_320MV |
	                values_adc_resolution.INA219_CONFIG_BADCRES_12BIT |
	                values_shunt_resolution.INA219_CONFIG_SADCRES_12BIT_1S_532US |
	                values_operating_mode.INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS;
		
		this.wireWriteRegister(INA219_REG_CONFIG, config);

	};
	
	setCalibration_32V_1A(){

		// By default we use a pretty huge range for the input voltage,
		// which probably isn't the most appropriate choice for system
		// that don't use a lot of power.  But all of the calculations
		// are shown below if you want to change the settings.  You will
		// also need to change any relevant register settings, such as
		// setting the VBUS_MAX to 16V instead of 32V, etc.

		// VBUS_MAX = 32V		(Assumes 32V, can also be set to 16V)
		// VSHUNT_MAX = 0.32	(Assumes Gain 8, 320mV, can also be 0.16, 0.08, 0.04)
		// RSHUNT = 0.1			(Resistor value in ohms)

		// 1. Determine max possible current
		// MaxPossible_I = VSHUNT_MAX / RSHUNT
		// MaxPossible_I = 3.2A

		// 2. Determine max expected current
		// MaxExpected_I = 1.0A

		// 3. Calculate possible range of LSBs (Min = 15-bit, Max = 12-bit)
		// MinimumLSB = MaxExpected_I/32767
		// MinimumLSB = 0.0000305             (30.5�A per bit)
		// MaximumLSB = MaxExpected_I/4096
		// MaximumLSB = 0.000244              (244�A per bit)

		// 4. Choose an LSB between the min and max values
		//    (Preferrably a roundish number close to MinLSB)
		// CurrentLSB = 0.0000400 (40�A per bit)

		// 5. Compute the calibration register
		// Cal = trunc (0.04096 / (Current_LSB * RSHUNT))
		// Cal = 10240 (0x2800)

		this.ina219_calValue = 10240;

		// 6. Calculate the power LSB
		// PowerLSB = 20 * CurrentLSB
		// PowerLSB = 0.0008 (800�W per bit)

		// 7. Compute the maximum current and shunt voltage values before overflow
		//
		// Max_Current = Current_LSB * 32767
		// Max_Current = 1.31068A before overflow
		//
		// If Max_Current > Max_Possible_I then
		//    Max_Current_Before_Overflow = MaxPossible_I
		// Else
		//    Max_Current_Before_Overflow = Max_Current
		// End If
		//
		// ... In this case, we're good though since Max_Current is less than MaxPossible_I
		//
		// Max_ShuntVoltage = Max_Current_Before_Overflow * RSHUNT
		// Max_ShuntVoltage = 0.131068V
		//
		// If Max_ShuntVoltage >= VSHUNT_MAX
		//    Max_ShuntVoltage_Before_Overflow = VSHUNT_MAX
		// Else
		//    Max_ShuntVoltage_Before_Overflow = Max_ShuntVoltage
		// End If

		// 8. Compute the Maximum Power
		// MaximumPower = Max_Current_Before_Overflow * VBUS_MAX
		// MaximumPower = 1.31068 * 32V
		// MaximumPower = 41.94176W

		// Set multipliers to convert raw current/power values
		this.ina219_currentDivider_mA = 25;      // Current LSB = 40uA per bit (1000/40 = 25)
		this.ina219_powerMultiplier_mW = 1;         // Power LSB = 800mW per bit

		// Set Calibration register to 'Cal' calculated above	
		this.wireWriteRegister(INA219_REG_CALIBRATION, this.ina219_calValue);

		// Set Config register to take into account the settings above
		var config = 	voltage_ranges.INA219_CONFIG_BVOLTAGERANGE_32V |
	                gain_bits.INA219_CONFIG_GAIN_8_320MV |
	                values_adc_resolution.INA219_CONFIG_BADCRES_12BIT |
	                values_shunt_resolution.INA219_CONFIG_SADCRES_12BIT_1S_532US |
	                values_operating_mode.INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS;
	
		this.wireWriteRegister(INA219_REG_CONFIG, config);

	};

	setCalibration_16V_400mA(){

		// Calibration which uses the highest precision for 
		// current measurement (0.1mA), at the expense of 
		// only supporting 16V at 400mA max.

		// VBUS_MAX = 16V
		// VSHUNT_MAX = 0.04          (Assumes Gain 1, 40mV)
		// RSHUNT = 0.1               (Resistor value in ohms)

		// 1. Determine max possible current
		// MaxPossible_I = VSHUNT_MAX / RSHUNT
		// MaxPossible_I = 0.4A

		// 2. Determine max expected current
		// MaxExpected_I = 0.4A

		// 3. Calculate possible range of LSBs (Min = 15-bit, Max = 12-bit)
		// MinimumLSB = MaxExpected_I/32767
		// MinimumLSB = 0.0000122              (12uA per bit)
		// MaximumLSB = MaxExpected_I/4096
		// MaximumLSB = 0.0000977              (98uA per bit)

		// 4. Choose an LSB between the min and max values
		//    (Preferrably a roundish number close to MinLSB)
		// CurrentLSB = 0.00005 (50uA per bit)

		// 5. Compute the calibration register
		// Cal = trunc (0.04096 / (Current_LSB * RSHUNT))
		// Cal = 8192 (0x2000)

		this.ina219_calValue = 8192;

		// 6. Calculate the power LSB
		// PowerLSB = 20 * CurrentLSB
		// PowerLSB = 0.001 (1mW per bit)

		// 7. Compute the maximum current and shunt voltage values before overflow
		//
		// Max_Current = Current_LSB * 32767
		// Max_Current = 1.63835A before overflow
		//
		// If Max_Current > Max_Possible_I then
		//    Max_Current_Before_Overflow = MaxPossible_I
		// Else
		//    Max_Current_Before_Overflow = Max_Current
		// End If
		//
		// Max_Current_Before_Overflow = MaxPossible_I
		// Max_Current_Before_Overflow = 0.4
		//
		// Max_ShuntVoltage = Max_Current_Before_Overflow * RSHUNT
		// Max_ShuntVoltage = 0.04V
		//
		// If Max_ShuntVoltage >= VSHUNT_MAX
		//    Max_ShuntVoltage_Before_Overflow = VSHUNT_MAX
		// Else
		//    Max_ShuntVoltage_Before_Overflow = Max_ShuntVoltage
		// End If
		//
		// Max_ShuntVoltage_Before_Overflow = VSHUNT_MAX
		// Max_ShuntVoltage_Before_Overflow = 0.04V

		// 8. Compute the Maximum Power
		// MaximumPower = Max_Current_Before_Overflow * VBUS_MAX
		// MaximumPower = 0.4 * 16V
		// MaximumPower = 6.4W

		// Set multipliers to convert raw current/power values
		this.ina219_currentDivider_mA = 20;  // Current LSB = 50uA per bit (1000/50 = 20)
		this.ina219_powerMultiplier_mW = 1;     // Power LSB = 1mW per bit

		// Set Calibration register to 'Cal' calculated above 
		this.wireWriteRegister(INA219_REG_CALIBRATION, ina219_calValue);

		// Set Config register to take into account the settings above
		var config = 	voltage_ranges.INA219_CONFIG_BVOLTAGERANGE_16V |
                	gain_bits.INA219_CONFIG_GAIN_1_40MV |
	                values_adc_resolution.INA219_CONFIG_BADCRES_12BIT |
	                values_shunt_resolution.INA219_CONFIG_SADCRES_12BIT_1S_532US |
	                values_operating_mode.INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS;
		
		this.wireWriteRegister(INA219_REG_CONFIG, config);

	};

	getBusVoltage_V(){

		return this.busvoltageraw * 0.001;

	};

	getShuntVoltage_mV(){
	
		return this.shuntvoltageraw * 0.01;

	};

	getCurrent_mA(){

		var valueDec = this.currentraw;
		valueDec /= this.ina219_currentDivider_mA;
		return valueDec;
		
	};
	
	getPower_mW(){
		
		var valueDec = this.powerraw;
		valueDec *= this.ina219_powerMultiplier_mW;
		return valueDec;

	};

	wireWriteRegister(reg, value) {

		var command = 'i2cset -y 0 '+formatToHex(INA219_ADDRESS)+' '+formatToHex(reg)+' '+formatToHex(value);

		exec(command);

	};
	
	wireReadRegister(reg) {
		
		var command = 'i2cget -y 0 '+formatToHex(INA219_ADDRESS)+' '+formatToHex(reg);
		
		return new Promise(function(resolve, reject) {
		
			console.log("Command "+command);
			
			exec(command, function(err,out,code){
				
				if (err != null)
					reject(err);
				else
					resolve(out);
			});
		});
	}

	getBusVoltage_raw(callback){
		this.wireReadRegister(INA219_REG_BUSVOLTAGE)
			.then(function(result){
				console.log("Res. Bus voltage raw "+result);
				// Shift to the right 3 to drop CNVR and OVF and multiply by LSB
				return callback(parseInt(((result >> 3) * 4)));
			})
			.catch(function(err){
				console.log("Something went wrong "+err)
			});
	};
	
	updateBusVoltage_raw(value){
		this.busvoltageraw = value;
	};

	getShuntVoltage_raw(callback){
		this.wireReadRegister(INA219_REG_SHUNTVOLTAGE)
			.then(function(result){
				console.log("Res. Shunt voltage raw "+result);
				return callback(parseInt(result));
			})
			.catch(function(err){
				console.log("Something went wrong "+err)
			});
	};

	updateShuntVoltage_raw(value){
		this.shuntvoltageraw = value;
	};

	getCurrent_raw(callback){

		var value;

		// Sometimes a sharp load will reset the INA219, which will
		// reset the cal register, meaning CURRENT and POWER will
		// not be available ... avoid this by always setting a cal
		// value even if it's an unfortunate extra step

		this.wireWriteRegister(INA219_REG_CALIBRATION, this.ina219_calValue);

		// Now we can safely read the CURRENT register!
		this.wireReadRegister(INA219_REG_CURRENT)
			.then(function(result){
				console.log("Res. Current raw "+result);
				return callback(parseInt(result));
			})
			.catch(function(err){
				console.log("Something went wrong "+err)
			});
			
	};
	
	updateCurrent_raw(value){
		this.currentraw = value;
	};
	
	getPower_raw(callback){

		var value;

		// Sometimes a sharp load will reset the INA219, which will
		// reset the cal register, meaning CURRENT and POWER will
		// not be available ... avoid this by always setting a cal
		// value even if it's an unfortunate extra step
		this.wireWriteRegister(INA219_REG_CALIBRATION, this.ina219_calValue);

		// Now we can safely read the POWER register!
		this.wireReadRegister(INA219_REG_POWER)
			.then(function(result){
				console.log("Res. Power raw "+result);
				return callback(parseInt(result));
			})
			.catch(function(err){
				console.log("Something went wrong "+err)
			});
			
	};

	updatePower_raw(value){
		this.powerraw = value;
	};

};


module.exports.sensor = Adafruit_INA219;
       
