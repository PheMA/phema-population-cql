const fetch = require("node-fetch");
const fs = require("fs").promises;

const results = [];

const fhirBaseUrl = "http://local.psbrandt.io:8080/hapi-fhir-jpaserver/fhir";
const cqlServiceURl = "http://local.psbrandt.io:3333/cql/evaluate";
const phenotypePath = "./heart-failure.phenotype.cql";

let phenotype;

const buildPayload = patientId => {
  return {
    code: phenotype,
    terminologyServiceUri: fhirBaseUrl,
    dataServiceUri: fhirBaseUrl,
    patientId
  };
};

const findNext = links => {
  const next = links.find(link => link.relation === "next");

  return !next ? null : next.url;
};

const processBundle = async bundle => {
  return new Promise(async (resolve, reject) => {
    if (!bundle.entry) resolve(null);

    for (let i = 0; i < bundle.entry.length; i++) {
      const entry = bundle.entry[i];
      const patientId = entry.resource.id;

      const body = buildPayload(patientId);

      console.log(`Posting evaluation request for Patient ${patientId}`);

      await fetch(cqlServiceURl, {
        method: "post",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
      })
        .then(res => {
          console.log(
            `Evaluation for Patient ${patientId} completed with response code ${res.status}`
          );

          return res.json();
        })
        .then(result => {
          results.push({ patientId, result });
        })
        .catch(e => {
          reject(e);
        });
    }

    resolve(findNext(bundle.link));
  });
};

const saveResults = () => {
  console.log("Saving results");

  fs.writeFile("results.json", JSON.stringify(results)).then(err => {
    if (err) throw err;

    console.log("Successfully saved results");
  });
};

const loadPhenotype = async () => {
  phenotype = await fs.readFile(phenotypePath, "utf8").then(data => data);
};

const run = async () => {
  await loadPhenotype();

  let next =
    "http://local.psbrandt.io:8080/hapi-fhir-jpaserver/fhir/Patient?_count=50";

  do {
    next = await fetch(next)
      .then(res => res.json())
      .then(processBundle)
      .catch(e => saveResults());
  } while (next != null);

  saveResults();
};

run();
