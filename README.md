<p align="center"><img src="/img/logo.jpg" height="120" /></p>
<h1>BACK-END</h1>
<p><em>This document provides general information on the Buzz-Kill app and details on the api.  For more information about the Buzz-Kill client, please see <a href="https://github.com/jackseabolt/buzz-kill-frontend/blob/master/README.md">Buzz-Kill front end</a>.</em></p>


Why Buzz-Kill
-------------
Every restaurant, bar and club owner wants to provide a safe and enjoyable guest experience.  Buzz-Kill is an easy-to-use tool that helps managers and their staff monitor patrons' alcohol consumption and spot potential problems early.  It requires minimal additional effort by servers and presents information in a format that is easy for busy managers to process in a quick glance.

How it Works
------------
<table layout="fixed">
  <tr>
    <td width="55%">
      <p>Buzz-Kill's main screen displays colored boxes representing each patron in the establishment.</p>
    </td>
    <td width = "40%">
      <img src="/img/buzz-kill-main.png" max-height="240px" width="auto">
    </td>
  </tr>
  <tr>
    <td>
      <p>When a new patron arrives, the server includes simple, additional information required for the ongoing bac calculation.          </p>
    </td>
    <td>
      <img src="/img/buzz-kill-addpatron.png" max-height="240px" witdh="auto">
    </td>
  </tr>
  <tr>
    <td>
      <p>The large numbers and color coding make the patron tile easy to understand.  Additionl information available includes seat location, time of stay, and a graphic representation of drink purchases.</p>
    </td>
    <td>
      <img src="/img/buzz-kill-patrondet.png" max-height="240px" witdh="auto">
    </td>
  </tr>
  <tr>
    <td>
      <p>And if someone goes too far, help is a click away.</p>
    </td>
    <td>
      <img src="/img/buzz-kill-patronemergency.png" max-height="240px" witdh="auto">
    </td>
  </tr>
</table>

|deployed client           |   https://buzz-kill-bbp.herokuapp.com/             .                    |
|client code               |   https://github.com/brianjb-lfl/buzz-kill-frontend                     |
|deployed api              |   https://buzz-kill-backend-bbp.herokuapp.com/                          |
|api code                  |   https://github.com/brianjb-lfl/buzz-kill-back                         | 

|  **Field**          |         **Description**                                                      |
|:--------------------|:-----------------------------------------------------------------------------|
|  id                 |  uniquely assigned id                                                        |
|  table              |  number, table number at which patron is seated                              |
|  seat               |  number, seat in which patron is seated                                      |
|  weight             |  number, for bac calculation, patron's estimated weight                      |
|  gender             |  string, for bac calculation, patron's apparent gender                       |
|  start              |  timestamp - when patron arrived at establishment                            |
|  **drinks**         |  array of objects, each representing a drink consumed by the patron          |
|  drinks: drinkEq    |  number, relative strength/alcohol content of drink<br>e.g. 1 = 12oz beer, glass of wine, or shot of liquor
|  drinks: drinkTime  |  timestamp, time at which drink was ordered, used in bac calculation         |
|                     |                                                                              |
|  virtual fields     |                                                                              |
|  *bac*              |  number, patron's estimated blood-alcohol level with leading ".0" removed    |
|  *timeOnSite*       |  string, format "hh:mm" representing the patron's current length of stay     |
|  *seatString*       |  string, format "Table # - Seat #" summarizing patron's location             |


Endpoints
------
Base url:  https://buzz-kill-backend-bbp.herokuapp.com/

**GET api/patrons**<br>
Returns array of objects with detailed information on each patron in the establishment.  Sample patron object:
```    
    {
        "id": "59f2970fc2722500123d4f03",
        "seatString": "Table 1 - Seat 1",
        "start": "2017-10-27T02:16:47.983Z",
        "drinks": [
            {
                "_id": "59f2971fc2722500123d4f04",
                "drinkTime": "2017-10-27T02:17:03.586Z",
                "drinkEq": 1
            }
        ],
        "bac": "0.9",
        "timeOnSite": "1:10"
    }
```
On success, return code: 200
On failure, return code: 500


**POST api/patrons**<br>
Include in header ...  Content-Type:  application/json
Include in body ... table, seat, gender and weight (optional)


```
{
	"table": "1",
	"seat": "2",
	"gender": "m"
}
```
On success, return code: 201
On failure, return code: 422 (input error), or 500 (server error)
Will return detailed information (see GET call) on the patron just added.


**PUT api/drinks/patron_id**<br>
Include in header ...  Content-Type:  application/json
Include in body ... patron's id (must match id in url) and drink equivalent

```
{
	"_id": "59f2970fc2722500123d4f03",
	"drinks": {"drinkEq": 1.5}
}
```
On success, return code: 201
On failure, return code: 400 (input error) or 500 (server error)

Will return detailed information (see GET call) on the patron just added.


**DELETE api/patrons/patron_id**<br>
Id in url must be valid id of currently active patron.

On success, return code: 204
On failure, return code: 422 (input error) or 500 (server error)

**DELETE api/patrons/dayclose**<br>
CAUTION:  This will delete all from the patrons collection.  This cannot be undone.

On success, return code: 204
On failure, return code: 500

Technology Used
------
* node.js
* express
* cors
* moment
* mongodb
* mongoose
* mocha, chai
