How to invoke this function:

```bash
sls invoke local -f updateMenu --path testData/update-menu.json
```

### What to pass to the endpoint on postman:

```javascript
{
  "pathParameters": {
    "vendorId": "werw234-wrt234-gtyy4445"
  },
  "body": {
    "original": {
      "vendorId": "werw234-wrt234-gtyy4445",
      "menu": [], // menu content inside the array
      "restaurantInfo": {
        "City": "San Jose",
        "Location": "200 Park Avenue",
        "Name": "Beck's NoodleHouse",
        "PhoneNumber": "917-555-6666",
        "State": "CA",
        "Zipcode": "95035"
      }
    },
    "modified": {
      "vendorId": "werw234-wrt234-gtyy4445",
      "menu": [], // menu content inside the array, modified
      "restaurantInfo": {
        "City": "San Jose",
        "Location": "200 Park Avenue",
        "Name": "Beck's NoodleHouse",
        "PhoneNumber": "917-555-6666",
        "State": "CA",
        "Zipcode": "95035"
      }
    }
  }
}
```
