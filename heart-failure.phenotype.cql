library "PhEMA Heart Failure" version '1.0.0'

using FHIR version '3.0.0'

include FHIRHelpers version '3.0.0'

codesystem "ActCodes": 'http://hl7.org/fhir/v3/ActCode'

valueset "Echo VS": '2.16.840.1.999999.1'
valueset "HF Dx VS": '2.16.840.1.113883.3.526.3.376'

code "Inpatient Encounter": 'IMP' from "ActCodes"
code "Outpatient Encounter": 'AMB' from "ActCodes"

context Patient

define "Adult":
    AgeInYears() >= 18
     
define "Has Echo":
    exists(["Procedure": code in "Echo VS"])
      
define "Has HF Dx":
    exists(["Condition": "HF Dx VS"])      

  
define "Inpatient Encounters With HF Dx":
    [Encounter: class in "Inpatient Encounter"] E
        with [Condition: "HF Dx VS"] C
            such that 'Encounter/' + E.id = C."context".reference

define "Outpatient Encounters With HF Dx":
    [Encounter: class in "Outpatient Encounter"] E
        with [Condition: "HF Dx VS"] C
            such that 'Encounter/' + E.id = C."context".reference

define "Encounter Criteria":
    exists("Inpatient Encounters With HF Dx") or
    Count("Outpatient Encounters With HF Dx") >= 2

define "Case":
    "Adult" and "Has Echo" and "Encounter Criteria"