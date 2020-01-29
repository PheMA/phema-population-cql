# PhEMA Population CQL Runner

The reference implementation of the CQL engine doesn't yet fully implement the
population context. This small tool can be used to run a CQL library against a
population of FHIR patients.

To use, simply edit the values at the of [`index.js`](index.js) and run:

```
$ node index.js
```