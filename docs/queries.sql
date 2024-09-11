SELECT DISTINCT
    ?keyClass (GROUP_CONCAT(?label; separator=" / ") AS ?labels)
WHERE {
  VALUES ?domain { <https://w3id.org/italia/onto/Learning> }

  ?domain <https://w3id.org/italia/onto/ADMS/hasKeyClass> ?keyClass .

  OPTIONAL {
    ?keyClass rdfs:label ?label . FILTER (lang(?label) = 'it')
    }
}
