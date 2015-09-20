#!/usr/bin/awk -f

BEGIN {
    FS = ":";
}
$1 ~ /description/ {
    description=$0;
    gsub(/^ *\"description\"/,"description",description);
    gsub(/,$/,"",description);
}
$1 ~ /stroke-width/ {
    if ($2 ~ /null/) {
        strokeWidth="stroke_width: 4";
    }
    else {
        strokeWidth="stroke_width: " $2;
    }
}
$1 ~ /type/ && in_geometry==0 {
    type=substr($2, 3, length($2)-4);
}
$1 ~ /name/ {
    name=$0;
    gsub(/^.*"name":[^"]*"/,"",name);
    gsub(/",$/,"",name);
    id=tolower(name);
    gsub(/ +/,"-",id);
    gsub(/[^a-z0-9-]+/, "-", id);
    gsub(/-+/,"-",id);
    gsub(/-$/,"",id);
    gsub(/^-/,"",id);
}
$1 ~ /geometry/ && $2 ~ /{/ || $1 ~ /geometries/ && $2 ~ /\[/ {
    in_geometry=1;
    geometry="";
}
(in_geometry==1 && $0 ~ /^  },$/) || (in_geometry==1 && $0 ~ /^  ],$/) {
    gsub(/^ */,"",$0);
    gsub(/,$/," ",$0);
    geometry = geometry $0;
    in_geometry=0;
}
in_geometry {
    gsub(/^ */,"",$0);
    geometry = geometry $0;
}
$1 ~ /}$/ && in_geometry==0{
    filename=id ".html";
    print "---\ntitle: \"" name "\"\n" description "\ntype: \"" type "\"\nid: \"" id "\"\ngeometry: \'" geometry "\'\n" strokeWidth "\n---\n{{description}}" > filename;
    close(filename);
}