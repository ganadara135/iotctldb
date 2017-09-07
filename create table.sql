CREATE TABLE device(
deviceaddress character(1) COLLATE utf8_bin  NOT NULL,
dateofenroll character(1) COLLATE utf8_bin ,
autoincrement integer NOT NULL,
teleport character(1) COLLATE utf8_bin  NOT NULL,
devicepurpose character(1) COLLATE utf8_bin ,
inputoraddress character(1) COLLATE utf8_bin  NOT NULL,
devicename character(1) COLLATE utf8_bin ,
devicepubkey character(1) COLLATE utf8_bin  NOT NULL,
CONSTRAINT pk PRIMARY KEY(deviceAddress)
) COLLATE utf8_bin ;

CREATE TABLE [user](
[password] character(1) COLLATE utf8_bin  NOT NULL,
dateofenroll timestamp,
address character(1) COLLATE utf8_bin  NOT NULL,
autoincrement integer NOT NULL,
pubkey character(1) COLLATE utf8_bin ,
userid character(1) COLLATE utf8_bin  NOT NULL,
CONSTRAINT pk PRIMARY KEY(address)
) COLLATE utf8_bin ;

CREATE TABLE userdevicerelationship(
deviceaddressr character(1) COLLATE utf8_bin ,
useraddressr character(1) COLLATE utf8_bin ,
bookingtime timestamp,
dateofenroll timestamp NOT NULL,
approvaltime timestamp,
autoincrement integer NOT NULL,
CONSTRAINT pk PRIMARY KEY(autoIncrement),
 CONSTRAINT  fk_userDeviceRelationship_deviceAddressR FOREIGN KEY (deviceAddressR) REFERENCES device(deviceAddress) ON DELETE RESTRICT ON UPDATE RESTRICT,
 CONSTRAINT  fk_userDeviceRelationship_userAddressR FOREIGN KEY (userAddressR) REFERENCES [user](address) ON DELETE RESTRICT ON UPDATE RESTRICT
) COLLATE utf8_bin ;