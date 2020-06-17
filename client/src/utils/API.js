import axios from "axios";

export default {
  generateBill: function (billInput) {
    return axios.post("/api/telescopicbill",billInput);
  },
};
