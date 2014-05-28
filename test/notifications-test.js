var _             = require('lodash');
var chai          = require('chai');
var sinon         = require('sinon');
var sinonchai     = require('sinon-chai');
var expect        = chai.expect;
var server_lib    = require('../lib/server-lib');
var notifications = require('../api/notifications');
var ripple        = require('ripple-lib');
chai.use(sinonchai);

describe('api/notifications', function(){

  describe('.getNotification()', function(done){

    it('should respond with an error if there is no connection to rippled', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now() - server_lib.CONNECTION_TIMEOUT - 1 // Considered disconnected
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {}
      };

      notifications.get($, {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          identifier: 'some_identifier'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('rippled');
          done();
        }
      });

    });

    it('should respond with an error if the account is missing', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now()
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          identifier: 'some_identifier'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(404);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('Transaction not found');
          done();
        }
      });

    });

    it('should respond with an error if the account is invalid', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now()
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'notvalid',
          identifier: 'some_identifier'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('account');
          done();
        }
      });

    });

    it('should respond with an error if the identifier is missing', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now()
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('identifier');
          done();
        }
      });

    });

    it('should respond with an error if the identifier is invalid', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now()
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){}
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz',
          identifier: 'some\n INVALID \nidentifier'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('identifier');
          done();
        }
      });

    });

    it('should respond with an error if the transaction corresponding to the given hash did not affect the specified account', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now()
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rLpq5RcRzA8FU1yUqEPW4xfsdwon7casuM',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(400);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('did not affect the given account');
          done();
        }
      });

    });

    it('should respond with an error if the ledger containing the base transaction is not in the rippleds complete ledger set', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now(),
              _opts: {
                url: ''
              }
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "accepted": true,
                "account_hash": "821981700D3CA8AAD34389CA5698A54024786F4111A3F5D1E758A76C3F89194F",
                "close_time": 453925550,
                "close_time_human": "2014-May-20 18:25:50",
                "close_time_resolution": 10,
                "closed": true,
                "hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_index": "6735142",
                "parent_hash": "28DD6A8E5CD4341E9F732B8D41ECB46DBBCF14CB9A5193F3782511CAC038C48A",
                "seqNum": "6735142",
                "totalCoins": "99999990180825196",
                "total_coins": "99999990180825196",
                "transaction_hash": "AE3F8F80E78BF742115AEDCBDD37E4362D24B311FB28744892D5D2C0509F9D55"
              }
            });
          },
          requestServerInfo: function(callback) {
            callback(null, {
              "info": {
                "build_version": "0.25.1",
                "complete_ledgers": "6735143-6777223",
                "hostid": "WAGE",
                "io_latency_ms": 1,
                "last_close": {
                  "converge_time_s": 2.004,
                  "proposers": 5
                },
                "load_factor": 1,
                "peers": 33,
                "pubkey_node": "n9LJ5eCNjeUXQpNXHCcLv9PQ8LMFYy4W8R1BdVNcpjc1oDwe6XZF",
                "server_state": "full",
                "validated_ledger": {
                  "age": 9,
                  "base_fee_xrp": 0.00001,
                  "hash": "E22187A7F79FE6CA67FE3705A5A3E046D2C74D160A3D7FF74A8821B55C67B765",
                  "reserve_base_xrp": 20,
                  "reserve_inc_xrp": 5,
                  "seq": 6777223
                },
                "validation_quorum": 3
              }
            })
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(500);
          expect(json_response.success).to.be.false;
          expect(json_response.message).to.contain('complete ledger set');
          done();
        }
      });


    });

    it('should include the hashes of the previous and next transactions', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now(),
              _opts: {
                url: ''
              }
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "accepted": true,
                "account_hash": "821981700D3CA8AAD34389CA5698A54024786F4111A3F5D1E758A76C3F89194F",
                "close_time": 453925550,
                "close_time_human": "2014-May-20 18:25:50",
                "close_time_resolution": 10,
                "closed": true,
                "hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_index": "6735142",
                "parent_hash": "28DD6A8E5CD4341E9F732B8D41ECB46DBBCF14CB9A5193F3782511CAC038C48A",
                "seqNum": "6735142",
                "totalCoins": "99999990180825196",
                "total_coins": "99999990180825196",
                "transaction_hash": "AE3F8F80E78BF742115AEDCBDD37E4362D24B311FB28744892D5D2C0509F9D55"
              }
            });
          },
          requestServerInfo: function(callback) {
            callback(null, {
              "info": {
                "build_version": "0.25.1",
                "complete_ledgers": "32570-6777223",
                "hostid": "WAGE",
                "io_latency_ms": 1,
                "last_close": {
                  "converge_time_s": 2.004,
                  "proposers": 5
                },
                "load_factor": 1,
                "peers": 33,
                "pubkey_node": "n9LJ5eCNjeUXQpNXHCcLv9PQ8LMFYy4W8R1BdVNcpjc1oDwe6XZF",
                "server_state": "full",
                "validated_ledger": {
                  "age": 9,
                  "base_fee_xrp": 0.00001,
                  "hash": "E22187A7F79FE6CA67FE3705A5A3E046D2C74D160A3D7FF74A8821B55C67B765",
                  "reserve_base_xrp": 20,
                  "reserve_inc_xrp": 5,
                  "seq": 6777223
                },
                "validation_quorum": 3
              }
            })
          },
          requestAccountTx: function(params, callback) {
            if (params.ledger_index_max === 6735142 && params.ledger_index_min === 6735142) {
              callback(null, {
                "transactions": [
                  {
                    "meta": {
                      "AffectedNodes": [
                        {
                          "ModifiedNode": {
                            "FinalFields": {
                              "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                              "Balance": "241338604",
                              "Flags": 1048576,
                              "OwnerCount": 6,
                              "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                              "Sequence": 270
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                            "PreviousFields": {
                              "Balance": "241338594"
                            },
                            "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                            "PreviousTxnLgrSeq": 6735099
                          }
                        },
                        {
                          "ModifiedNode": {
                            "FinalFields": {
                              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                              "Balance": "79521203",
                              "Flags": 0,
                              "OwnerCount": 9,
                              "Sequence": 154
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                            "PreviousFields": {
                              "Balance": "79521225",
                              "Sequence": 153
                            },
                            "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                            "PreviousTxnLgrSeq": 6735099
                          }
                        }
                      ],
                      "TransactionIndex": 1,
                      "TransactionResult": "tesSUCCESS"
                    },
                    "tx": {
                      "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                      "Amount": "10",
                      "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                      "DestinationTag": 123,
                      "Fee": "12",
                      "Flags": 2147483648,
                      "LastLedgerSequence": 6735147,
                      "Sequence": 153,
                      "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                      "SourceTag": 456,
                      "TransactionType": "Payment",
                      "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                      "date": 453925550,
                      "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                      "inLedger": 6735142,
                      "ledger_index": 6735142
                    },
                    "validated": true
                  }
                ]
              });
            } else if (params.ledger_index_min === 6735142) {
              expect(params.forward).to.be.true;
              callback(null, {"transactions": [
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338604",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338594"
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521203",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 154
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521225",
                            "Sequence": 153
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      }
                    ],
                    "TransactionIndex": 1,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735147,
                    "Sequence": 153,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                    "date": 453925550,
                    "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                    "inLedger": 6735142,
                    "ledger_index": 6735142
                  },
                  "validated": true
                },
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338616",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338604"
                          },
                          "PreviousTxnID": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                          "PreviousTxnLgrSeq": 6735142
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521179",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 155
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521203",
                            "Sequence": 154
                          },
                          "PreviousTxnID": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                          "PreviousTxnLgrSeq": 6735142
                        }
                      }
                    ],
                    "TransactionIndex": 7,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "12",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "Fee": "12",
                    "Flags": 0,
                    "Sequence": 154,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "TransactionType": "Payment",
                    "TxnSignature": "304402200540402A3008E1D41645C85E08B16AAFA5FB141EE26996DA470F7CDB657E7DB302200A8D7BDB073788EF486969D993E47E873E94EBEB26069E8C8B1B7969F02E5C01",
                    "date": 454624620,
                    "hash": "A990DDD82F6B4F54CF1763121766C113330A35235C44B547C67EB2AF8E0D3201",
                    "inLedger": 6886435,
                    "ledger_index": 6886435
                  },
                  "validated": true
                }
              ]});
            } else if (params.ledger_index_max === 6735142) {
              expect(params.forward).to.be.false;
              callback(null, {"transactions": [
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338604",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338594"
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521203",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 154
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521225",
                            "Sequence": 153
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      }
                    ],
                    "TransactionIndex": 1,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735147,
                    "Sequence": 153,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                    "date": 453925550,
                    "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                    "inLedger": 6735142,
                    "ledger_index": 6735142
                  },
                  "validated": true
                },
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338594",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338584"
                          },
                          "PreviousTxnID": "AE6516051C46549007AB1553DF75FA50B4DFF24D5AD35BD9476566B72250E956",
                          "PreviousTxnLgrSeq": 6721715
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521225",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 153
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521247",
                            "Sequence": 152
                          },
                          "PreviousTxnID": "AE6516051C46549007AB1553DF75FA50B4DFF24D5AD35BD9476566B72250E956",
                          "PreviousTxnLgrSeq": 6721715
                        }
                      }
                    ],
                    "TransactionIndex": 0,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735104,
                    "Sequence": 152,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "304402207FFB353BE1CB6F86CD04CDA632F5797C8C76B5EDE6A649F91A0E5BC7485A7A8D022007C2A71D20BD3EB3DC27465D117A39997D21B7C96473C37695893BFB5F1D34B9",
                    "date": 453925360,
                    "hash": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                    "inLedger": 6735099,
                    "ledger_index": 6735099
                  },
                  "validated": true
                }
              ]});
            }
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          },
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        }
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          expect(json_response.notification.next_hash).to.equal('A990DDD82F6B4F54CF1763121766C113330A35235C44B547C67EB2AF8E0D3201');
          expect(json_response.notification.previous_hash).to.equal('AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940');
          done();
        }
      }, function(err){
        expect(err).not.to.exist;
      });

    });

    it('should include urls pointing to the previous and next transactions', function(done){

      var $ = {
        remote: {
          _getServer: function() {
            return {
              _lastLedgerClose: Date.now(),
              _opts: {
                url: ''
              }
            };
          },
          once: function(){},
          on: function(){},
          connect: function(){},
          removeListener: function(){},
          requestTx: function(hash, callback) {
            callback(null, {
              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
              "Amount": "10",
              "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
              "DestinationTag": 123,
              "Fee": "12",
              "Flags": 2147483648,
              "LastLedgerSequence": 6735147,
              "Sequence": 153,
              "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
              "SourceTag": 456,
              "TransactionType": "Payment",
              "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
              "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
              "inLedger": 6735142,
              "ledger_index": 6735142,
              "meta": {
                "AffectedNodes": [
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                        "Balance": "241338604",
                        "Flags": 1048576,
                        "OwnerCount": 6,
                        "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                        "Sequence": 270
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                      "PreviousFields": {
                        "Balance": "241338594"
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  },
                  {
                    "ModifiedNode": {
                      "FinalFields": {
                        "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                        "Balance": "79521203",
                        "Flags": 0,
                        "OwnerCount": 9,
                        "Sequence": 154
                      },
                      "LedgerEntryType": "AccountRoot",
                      "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                      "PreviousFields": {
                        "Balance": "79521225",
                        "Sequence": 153
                      },
                      "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                      "PreviousTxnLgrSeq": 6735099
                    }
                  }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
              },
              "validated": true
            });
          },
          requestLedger: function(ledger_index, callback) {
            callback(null, {
              "ledger": {
                "accepted": true,
                "account_hash": "821981700D3CA8AAD34389CA5698A54024786F4111A3F5D1E758A76C3F89194F",
                "close_time": 453925550,
                "close_time_human": "2014-May-20 18:25:50",
                "close_time_resolution": 10,
                "closed": true,
                "hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_hash": "EC3467A6313C1A645EB2AA4A10096FEC13BBC087ACEA9ED60B3BE453E265E95F",
                "ledger_index": "6735142",
                "parent_hash": "28DD6A8E5CD4341E9F732B8D41ECB46DBBCF14CB9A5193F3782511CAC038C48A",
                "seqNum": "6735142",
                "totalCoins": "99999990180825196",
                "total_coins": "99999990180825196",
                "transaction_hash": "AE3F8F80E78BF742115AEDCBDD37E4362D24B311FB28744892D5D2C0509F9D55"
              }
            });
          },
          requestServerInfo: function(callback) {
            callback(null, {
              "info": {
                "build_version": "0.25.1",
                "complete_ledgers": "32570-6777223",
                "hostid": "WAGE",
                "io_latency_ms": 1,
                "last_close": {
                  "converge_time_s": 2.004,
                  "proposers": 5
                },
                "load_factor": 1,
                "peers": 33,
                "pubkey_node": "n9LJ5eCNjeUXQpNXHCcLv9PQ8LMFYy4W8R1BdVNcpjc1oDwe6XZF",
                "server_state": "full",
                "validated_ledger": {
                  "age": 9,
                  "base_fee_xrp": 0.00001,
                  "hash": "E22187A7F79FE6CA67FE3705A5A3E046D2C74D160A3D7FF74A8821B55C67B765",
                  "reserve_base_xrp": 20,
                  "reserve_inc_xrp": 5,
                  "seq": 6777223
                },
                "validation_quorum": 3
              }
            })
          },
          requestAccountTx: function(params, callback) {
            if (params.ledger_index_max === 6735142 && params.ledger_index_min === 6735142) {
              callback(null, {
                "transactions": [
                  {
                    "meta": {
                      "AffectedNodes": [
                        {
                          "ModifiedNode": {
                            "FinalFields": {
                              "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                              "Balance": "241338604",
                              "Flags": 1048576,
                              "OwnerCount": 6,
                              "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                              "Sequence": 270
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                            "PreviousFields": {
                              "Balance": "241338594"
                            },
                            "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                            "PreviousTxnLgrSeq": 6735099
                          }
                        },
                        {
                          "ModifiedNode": {
                            "FinalFields": {
                              "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                              "Balance": "79521203",
                              "Flags": 0,
                              "OwnerCount": 9,
                              "Sequence": 154
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                            "PreviousFields": {
                              "Balance": "79521225",
                              "Sequence": 153
                            },
                            "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                            "PreviousTxnLgrSeq": 6735099
                          }
                        }
                      ],
                      "TransactionIndex": 1,
                      "TransactionResult": "tesSUCCESS"
                    },
                    "tx": {
                      "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                      "Amount": "10",
                      "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                      "DestinationTag": 123,
                      "Fee": "12",
                      "Flags": 2147483648,
                      "LastLedgerSequence": 6735147,
                      "Sequence": 153,
                      "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                      "SourceTag": 456,
                      "TransactionType": "Payment",
                      "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                      "date": 453925550,
                      "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                      "inLedger": 6735142,
                      "ledger_index": 6735142
                    },
                    "validated": true
                  }
                ]
              });
            } else if (params.ledger_index_min === 6735142) {
              expect(params.forward).to.be.true;
              callback(null, {"transactions": [
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338604",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338594"
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521203",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 154
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521225",
                            "Sequence": 153
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      }
                    ],
                    "TransactionIndex": 1,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735147,
                    "Sequence": 153,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                    "date": 453925550,
                    "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                    "inLedger": 6735142,
                    "ledger_index": 6735142
                  },
                  "validated": true
                },
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338616",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338604"
                          },
                          "PreviousTxnID": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                          "PreviousTxnLgrSeq": 6735142
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521179",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 155
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521203",
                            "Sequence": 154
                          },
                          "PreviousTxnID": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                          "PreviousTxnLgrSeq": 6735142
                        }
                      }
                    ],
                    "TransactionIndex": 7,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "12",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "Fee": "12",
                    "Flags": 0,
                    "Sequence": 154,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "TransactionType": "Payment",
                    "TxnSignature": "304402200540402A3008E1D41645C85E08B16AAFA5FB141EE26996DA470F7CDB657E7DB302200A8D7BDB073788EF486969D993E47E873E94EBEB26069E8C8B1B7969F02E5C01",
                    "date": 454624620,
                    "hash": "A990DDD82F6B4F54CF1763121766C113330A35235C44B547C67EB2AF8E0D3201",
                    "inLedger": 6886435,
                    "ledger_index": 6886435
                  },
                  "validated": true
                }
              ]});
            } else if (params.ledger_index_max === 6735142) {
              expect(params.forward).to.be.false;
              callback(null, {"transactions": [
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338604",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338594"
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521203",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 154
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521225",
                            "Sequence": 153
                          },
                          "PreviousTxnID": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                          "PreviousTxnLgrSeq": 6735099
                        }
                      }
                    ],
                    "TransactionIndex": 1,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735147,
                    "Sequence": 153,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "3044022031B9FF8E213A59B7A51B105989D4D669634DF2B0853E4E041D2C2936EC4FA86802204149ADFD408DC75A4528B98B65CA0682A9BDF8CEB3DC842A5474C998FB62020F",
                    "date": 453925550,
                    "hash": "130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC",
                    "inLedger": 6735142,
                    "ledger_index": 6735142
                  },
                  "validated": true
                },
                {
                  "meta": {
                    "AffectedNodes": [
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                            "Balance": "241338594",
                            "Flags": 1048576,
                            "OwnerCount": 6,
                            "RegularKey": "rHq2wyUtLkAad3vURUk33q9gozd97skhSf",
                            "Sequence": 270
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "58D2E252AE8842B950C960B6BC7A3319762F1C66E3C35985A3B160479EFEDF23",
                          "PreviousFields": {
                            "Balance": "241338584"
                          },
                          "PreviousTxnID": "AE6516051C46549007AB1553DF75FA50B4DFF24D5AD35BD9476566B72250E956",
                          "PreviousTxnLgrSeq": 6721715
                        }
                      },
                      {
                        "ModifiedNode": {
                          "FinalFields": {
                            "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                            "Balance": "79521225",
                            "Flags": 0,
                            "OwnerCount": 9,
                            "Sequence": 153
                          },
                          "LedgerEntryType": "AccountRoot",
                          "LedgerIndex": "FA39C6EC43AA870B5E9ED592EF683CC1134DB60746C54A997B6BEAE366EF04C9",
                          "PreviousFields": {
                            "Balance": "79521247",
                            "Sequence": 152
                          },
                          "PreviousTxnID": "AE6516051C46549007AB1553DF75FA50B4DFF24D5AD35BD9476566B72250E956",
                          "PreviousTxnLgrSeq": 6721715
                        }
                      }
                    ],
                    "TransactionIndex": 0,
                    "TransactionResult": "tesSUCCESS"
                  },
                  "tx": {
                    "Account": "rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r",
                    "Amount": "10",
                    "Destination": "rKXCummUHnenhYudNb9UoJ4mGBR75vFcgz",
                    "DestinationTag": 123,
                    "Fee": "12",
                    "Flags": 2147483648,
                    "LastLedgerSequence": 6735104,
                    "Sequence": 152,
                    "SigningPubKey": "02BE53B7ACBB0900E0BB7729C9CAC1033A0137993B17800BD1191BBD1B29D96A8C",
                    "SourceTag": 456,
                    "TransactionType": "Payment",
                    "TxnSignature": "304402207FFB353BE1CB6F86CD04CDA632F5797C8C76B5EDE6A649F91A0E5BC7485A7A8D022007C2A71D20BD3EB3DC27465D117A39997D21B7C96473C37695893BFB5F1D34B9",
                    "date": 453925360,
                    "hash": "AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940",
                    "inLedger": 6735099,
                    "ledger_index": 6735099
                  },
                  "validated": true
                }
              ]});
            }
          }
        },
        dbinterface: {
          getTransaction: function(params, callback) {
            callback();
          },
          getFailedTransactions: function(params, callback) {
            callback(null, []);
          }
        },
        config: {
          get: function(key) {
            if (key === 'PORT') {
              return 80;
            }
          }
        }
      };

      notifications.get($, {
        params: {
          account: 'rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r',
          identifier: '130BA857E78D5A8BB27EACB911904A877C0A4D1EB66967AD6C86DE7DD3EC14BC'
        },
        protocol: 'http',
        host: 'localhost'
      }, {
        json: function(status_code, json_response) {
          expect(status_code).to.equal(200);
          console.log(json_response);
          expect(json_response.notification.next_notification_url).to.equal('http://localhost:80/v1/accounts/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/notifications/A990DDD82F6B4F54CF1763121766C113330A35235C44B547C67EB2AF8E0D3201');
          expect(json_response.notification.previous_notification_url).to.equal('http://localhost:80/v1/accounts/rNw4ozCG514KEjPs5cDrqEcdsi31Jtfm5r/notifications/AD8CD554D5E03E5558FDCE3D20A40A58088E8AD6ECA06885BAC9E1B0EDA72940');
          done();
        }
      }, function(err){
        expect(err).not.to.exist;
      });

    });

    // it('should correctly order notifications based on the accounts transaction history', function(){

    // });

    // it('should include the client_resource_id in the JSON response -- but not in the notification body -- when one is found in the database', function(){

    // });

    // it('should correctly identify the direction of transactions as incoming, outgoing, or passthrough', function(){

    // });

    // it('should return full URLs for the appropriate fields', function(){

    // });

    // it('should list the type as the resource, rather than transaction, type (payment, order, trustline, settings)', function(){

    // });

  });

});

// make sure to test that notifications are returned in the correct order