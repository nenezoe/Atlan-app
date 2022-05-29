import "./App.css";
import "./index.css";
import React, { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import ErrorModel from "./components/ErrorModule";
import "./components/ErrorModule.css";
import './components/Card.css'

function App() {
  const [query, setQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");
  const [showPredefinedQueries, setShowPredefinedQueries] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [
    { titleList: currentTitleList, valueList: currentValueList } = {},
    setResult,
  ] = useState({
    titleList: [],
    valueList: [],
  });
  console.log(`currentTitleList`, currentTitleList);
  console.log(`currentValueList`, currentValueList);

  const errorHandler = () => {
    setError(null);
  };
  const availableTables = [
    `categories`,
    `customers`,
    `employee_territories`,
    `employees`,
    `order_details`,
    `orders`,
    `products`,
    `regions`,
    `shippers`,
    `suppliers`,
    `territories`,
  ];
  const availableTablesMap = {};
  availableTables.forEach((currentTable) => {
    availableTablesMap[currentTable] = 1;
  });

  const processQuery = async (incomingQuery) => {
    setIsLoading(true);
    if (!incomingQuery || !(typeof incomingQuery === "string")) {
      // Invalid query
      setError({
        title: "invalid query",
        message: "Please enter a valid query",
      });
      setIsLoading(false);
      return false;
    }
    const deepCopiedQuery = `${incomingQuery}`.trim();
    if (!deepCopiedQuery.toLowerCase().startsWith("select ")) {
      // Query doesnt start with select
      setError({
        title: "invalid query",
        message: "Query doesnt start with select",
      });
      setIsLoading(false);
      return false;
    }
    const fromSlitted = deepCopiedQuery.split(/ from /i);
    if (!(fromSlitted.length > 1)) {
      // Query doesnt contain the SQL from verb
      setError({
        title: "invalid query",
        message: "Query doesnt contain the SQL from verb",
      });
      setIsLoading(false);
      return false;
    }

    if (!(fromSlitted.length === 2)) {
      // Query contains multiple SQL from verbs
      setError({
        title: "invalid query",
        message: "Query contains multiple SQL from verbs",
      });
      setIsLoading(false);
      return false;
    }

    if (/^select $/i.test(fromSlitted[0])) {
      // Query doesn't specify any column to fetch
      setError({
        title: "invalid query",
        message: "Query doesn't specify any column to fetch",
      });
      setIsLoading(false);
      return false;
    }

    let columns = fromSlitted[0].replace(/select /i, "");
    const baseTable = fromSlitted[1].trim().split(` `)[0];

    if (!baseTable) {
      // The base table is invalid
      setError({
        title: "invalid query",
        message: "The base table is invalid",
      });
      setIsLoading(false);
      return false;
    }
    if (!availableTablesMap[baseTable]) {
      // The column specified doesn't exist
      setError({
        title: "invalid query",
        message: "The column specified doesn't exist",
      });
      setIsLoading(false);
      return false;
    }
    try {
      const response = await fetch(`/${baseTable}.csv`, {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,xh;q=0.6",
          "if-modified-since": "Thu, 26 May 2022 19:09:05 GMT",
          "if-none-match": 'W/"985-18101c5bd8b"',
          "sec-ch-ua":
            '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      });
      setIsLoading(false);
      let theCSVContent = await response.text();
      console.log(`theCSVContent 0`, theCSVContent);
      let nextNextLineIndex = theCSVContent.indexOf(`\n`);
      const firstLineInString = theCSVContent.substring(0, nextNextLineIndex);
      const firstLineInStringSplittedMap = {};
      let firstLineInStringSplitted = [];
      firstLineInString
        .split(/[\s\t"'`,]{1,}/)
        .forEach((currentColumn, index, whole) => {
          firstLineInStringSplittedMap[currentColumn] = index;
          if (index === 0) {
            firstLineInStringSplitted = whole;
          }
        });
      console.log(`firstLineInStringSplittedMap`, firstLineInStringSplittedMap);
      console.log(`firstLineInStringSplitted`, firstLineInStringSplitted);
      theCSVContent = theCSVContent.substring(nextNextLineIndex + 1);
      if (columns === "*") {
        // console.log(`We are getting all columns from ${baseTable}`);
        columns = firstLineInString;
      }
      const columnsToGet = [];
      columns.split(/[\s\t"'`,]{1,}/).forEach((currentColumn, index) => {
        if (
          !isNaN(firstLineInStringSplittedMap[currentColumn]) &&
          Number.isInteger(Number(firstLineInStringSplittedMap[currentColumn]))
        ) {
          columnsToGet.push(firstLineInStringSplittedMap[currentColumn]);
        }
      });

      console.log(`columnsToGet`, columnsToGet);
      console.log(`columns`, columns);
      const titleList = columnsToGet.map((saidIndex) => {
        return firstLineInStringSplitted[saidIndex];
      });
      const valueList = [];
      nextNextLineIndex = theCSVContent.indexOf(`\n`);
      console.log(`nextNextLineIndex`, nextNextLineIndex);
      console.log(`theCSVContent 1`, theCSVContent);
      for (; nextNextLineIndex > 0; ) {
        const currentLineInString = theCSVContent.substring(
          0,
          nextNextLineIndex
        );
        const currentLineInStringSplitted =
          currentLineInString.split(/[\s\t"'`,]{1,}/);
        valueList.push(
          columnsToGet.map((saidIndex) => {
            return currentLineInStringSplitted[saidIndex];
          })
        );
        theCSVContent = theCSVContent.substring(nextNextLineIndex + 1);
        nextNextLineIndex = theCSVContent.indexOf(`\n`);
      }
      setResult({ titleList, valueList });
    } catch (error) {
      console.log(`error`, error);
      setIsLoading(false);
    }

   
  };

  return (
    <div >
      {error && (
        <ErrorModel
          title={error.title}
          message={error.message}
          onConfirm={errorHandler}
        /> 
      )}
      <div className="formarea">
        {" "}
        <Form.Control
          value={query}
          onChange={(event) => {
            event.preventDefault();
            setQuery(event.target.value);
          }}
          type="text"
          placeholder="Input text"
        />{" "}
        <div>
          <Button
            variant="primary"
            className="blur"
            onClick={(event) => {
              event.preventDefault();
              processQuery(query);
            }}
          >
            Submit
          </Button>{" "}
        </div>
      </div>
      <div className="toggledropdown">
        <div className="togglebtn">toggle here
          <label className="switch">
            <input
              type="checkbox"
              checked={showPredefinedQueries}
              onChange={(event) => {
                event.preventDefault();
                setShowPredefinedQueries(!!event.target.checked);
              }}
            />
            <span className="slider"></span>
          </label>
        </div>
        {!!showPredefinedQueries ? (
          <div>
            <select
              value={selectedQuery || ""}
              onChange={(event) => {
                event.preventDefault();
                setSelectedQuery(event.target.value);
                setQuery(`Select * from ${event.target.value}`);
                processQuery(`Select * from ${event.target.value}`);
              }}
            >
              <option value={""}>Select a Predefined Query</option>
              {availableTables.map((value, key) => {
                return (
                  <option
                    {...{ value, key }}
                  >{`Select * from ${value}`}</option>
                );
              })}
            </select>
          </div>
        ) : null}
      </div>
      <p>
        Available Tables are{" : "}
        {availableTables.join(`, `)}
      </p>
      {Array.isArray(currentTitleList) && !!currentTitleList.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              {currentTitleList.map((item, key) => {
                return <th {...{ key }}>{item}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {/* currentValueList */}
            {currentValueList.map((columns, key) => {
              return (
                <tr {...{ key }}>
                  <td>{key}</td>
                  {columns.map((item, key) => {
                    return <td {...{ key }}>{item}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : null}
    </div>
  );
}

export default App;
