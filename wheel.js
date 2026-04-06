const secondaryCols = [
    "Engagement civique", "Equilibre travail-vie", "Liens sociaux", "Logement",
    "Qualité environnementale", "Revenu et patrimoine", "Santé", "Savoirs et compétences",
    "Sécurité", "Travail et qualité de l'emploi"
];

const colors = new Map([
    // Minéral
    ["Revenu et patrimoine", "#A1A6AC"],
    ["Travail et qualité de l'emploi", "#757B82"],

    // Nature
    ["Logement", "#1F5238"],
    ["Equilibre travail-vie", "#2A6546"],
    ["Santé", "#143B29"],
    ["Qualité environnementale", "#356F4E"],

    // Océan
    ["Liens sociaux", "#255F8F"],
    ["Engagement civique", "#3F87C2"],
    ["Sécurité", "#184A72"],
    ["Savoirs et compétences", "#5FA8DD"],
]);

const stages = [
    {
        label: "Introduction",
        title: "Le bien-être, une statistique ?",
        copy: `Euphrosyne erre, perplexe : que signifie vraiment « être heureux » ? À l’échelle de quelques pays de l’Union européenne, la réponse n’est pas simple : malgré le marché commun qui nous unit, des différences sociales et structurelles persistent. Pour y voir plus clair, elle a consolidé plusieurs indicateurs afin de construire un score agrégé (une  <a href="https://github.com/brooks-code/hackaviz/blob/main/methodology.md" target="_blank" rel="noopener noreferrer" style="color: #9FBEDC;">note méthodologique</a> est disponible). Un bloc de pays clairement favorisés se dessine: la Finlande et les Pays‑Bas dominent le classement, avec une stabilité remarquable entre 2004 et 2024. Mais le paysage est plus nuancé qu’il n’y paraît, curieuse, Euphrosyne décide d’approfondir : tendances temporelles, écarts régionaux, et indices subjectifs versus indicateurs socio‑économiques révèlent des histoires contrastées. Prêts pour la suite de l’exploration ?
        <div class="legend-item">
            <span><br>🌬 Les stories défilent automatiquement, tu pourras ensuite les relire une par une.</span>
        </div>`,
        pills: ["bonheur", "data storytelling", "hackaviz 2026"],
        word: "INTRO"
    },
    {
        label: "Story n◦1",
        title: "Le paradoxe balte",
        copy: `Le « paradoxe balte » désigne un faible score agrégé (souvent parmi les trois derniers) mais un excellent classement selon l’indice de bien-être subjectif (halo coloré). Se sentir bien ne signifie donc pas nécessairement être bien classé selon les indicateurs socio‑économiques. Comment l’expliquer ? Les Baltes sont‑ils particulièrement optimistes, ou bien les méthodes de calcul des indices de bonheur les désavantagent‑elles ?<br><br>
        <div class="legend-item">
          <span class="legend-swatch" style="background: var(--perceptionGood)"></span>
          <span>Bonheur subjectif supérieur : expansion couleur rouge cabernet</span>
        </div>`,
        pills: ["états baltes", "décalage", "bien-être perçu"],
        word: "PARADOXE",
        focusYear: 2006,
        focusCountries: ["Lituanie", "Estonie", "Lettonie"],
        perceptionActive: true
    },
    {
        label: "Story n◦2",
        title: "Le Covid a rendu des fissures visibles",
        copy: `Des événements peuvent-ils influer massivement sur le bien-être ? Penchons‑nous sur la crise du Covid, dont les effets sont particulièrement perceptibles en 2021. Certaines économies ont mieux résisté ; d'autres ont eu plus de mal à encaisser le choc.<br>Deux exemples :<ul>
        <li>Allemagne : 0,553 → 0,436</li>
        <li>Finlande : 0,630 → 0,550</li>
      </ul>`,
        pills: ["pandémie", "perturbations", "crise sanitaire"],
        word: "COVID",
        focusYear: 2021,
        focusCountries: ["Allemagne", "Finlande"]
    },
    {
        label: "La roue du bonheur",
        title: "À toi de jouer !",
        copy: "Tu peux maintenant faire tourner la roue du bonheur pour découvrir d’autres récits. Observe, par exemple, les conséquences de la crise financière de 2008 sur des pays fortement endettés comme la Grèce ou l’Italie: l’impact sur l’indice de bien-être y est manifeste.",
        pills: ["vue radiale interactive", "exploration par pays", " lecture par année"],
        word: "EUROPA"
    }
];

const pct = d3.format(".1%");

const isoToFr = {
    GRC: "Grèce", ITA: "Italie", PRT: "Portugal", AUT: "Autriche", BEL: "Belgique",
    DEU: "Allemagne", ESP: "Espagne", FIN: "Finlande", FRA: "France", NLD: "Pays-Bas",
    BGR: "Bulgarie", HRV: "Croatie", SVN: "Slovénie", SVK: "République slovaque", EST: "Estonie",
    LTU: "Lituanie", LVA: "Lettonie", IRL: "Irlande", LUX: "Luxembourg"
};

const clusterDefs = [
    { id: 1, name: "Le Sud endetté", color: getComputedStyle(document.documentElement).getPropertyValue('--cluster1').trim(), codes: ["GRC", "ITA", "PRT"] },
    { id: 2, name: "Noyau fiscal historique de l'UE", color: getComputedStyle(document.documentElement).getPropertyValue('--cluster2').trim(), codes: ["AUT", "BEL", "DEU", "ESP", "FIN", "FRA", "NLD"] },
    { id: 3, name: "Europe centrale", color: getComputedStyle(document.documentElement).getPropertyValue('--cluster3').trim(), codes: ["SVK"] },
    { id: 4, name: "Groupe balte à faible revenus fiscaux", color: getComputedStyle(document.documentElement).getPropertyValue('--cluster4').trim(), codes: ["EST", "LTU", "LVA"] },
    { id: 5, name: "Économies ouvertes à revenus fiscaux élevés", color: getComputedStyle(document.documentElement).getPropertyValue('--cluster5').trim(), codes: ["IRL", "LUX"] }
];

const countryToCluster = new Map();
clusterDefs.forEach(c => c.codes.forEach(code => countryToCluster.set(isoToFr[code], c)));

let allData = [];
let yearList = [];
let currentYearIndex = 0;
let selectedCountry = null;
let playing = false;
let timer = null;
let stageIndex = 0;
let focusSet = null;
let tooltipTimer = null;
let currentYearForTooltip = null;
let currentYearData = [];
let hoverCountryName = null;
let lastStageIndex = 0;
let clusterMode = false;
let perceptionMode = false;

const width = 1400, height = 1400, cx = width / 2, cy = height / 2;
const innerRadius = 130, outerRadius = 510, basePad = 0.006;

const svg = d3.select("#chart");
const tooltip = d3.select("#tooltip");
const hud = d3.select("#hud");
const legendToggle = d3.select("#legendToggle");
const wrap = d3.select(".wrap");
const selectedCenter = d3.select("#selectedCenter");
const heroBox = d3.select("#heroBox");
const clusterToggleRow = d3.select("#clusterToggleRow");
const clusterToggle = d3.select("#clusterToggle");
const clusterLegend = d3.select("#clusterLegend");
const perceptionToggleRow = d3.select("#perceptionToggleRow");
const perceptionToggle = d3.select("#perceptionToggle");
const perceptionLegend = d3.select("#perceptionLegend");

const gRoot = svg.append("g").attr("transform", `translate(${cx},${cy})`);
const defs = svg.append("defs");

defs.append("filter").attr("id", "perceptionGlow").html(`
    <feGaussianBlur stdDeviation="4" result="blur"></feGaussianBlur>
    <feColorMatrix in="blur" type="matrix"
      values="1 0 0 0 0.15
              0 1 0 0 0.20
              0 0 1 0 0.50
              0 0 0 1 0" result="blueGlow"></feColorMatrix>
    <feMerge>
      <feMergeNode in="blueGlow"></feMergeNode>
      <feMergeNode in="SourceGraphic"></feMergeNode>
    </feMerge>
  `);

defs.append("filter").attr("id", "perceptionGlowSoft").html(`
    <feGaussianBlur stdDeviation="3" result="blur"></feGaussianBlur>
    <feColorMatrix in="blur" type="matrix"
      values="
        0.03 0.03 0.03 0 0
        0.03 0.03 0.03 0 0
        0.03 0.03 0.03 0 0
        0    0    0    1 0"
      result="darkGlow"></feColorMatrix>
    <feMerge>
      <feMergeNode in="darkGlow"></feMergeNode>
      <feMergeNode in="SourceGraphic"></feMergeNode>
    </feMerge>
  `);

const gridLayer = gRoot.append("g");
const dataLayer = gRoot.append("g");
const centerLayer = gRoot.append("g");

const heroTitle = d3.select("#heroTitle");
const heroCopy = d3.select("#heroCopy");
const stageLabel = d3.select("#stageLabel");
const heroPills = d3.select("#heroPills");
const bigWord = d3.select("#bigWord");
const centerYear = d3.select("#centerYear");
const centerName = d3.select("#centerName");
const centerScore = d3.select("#centerScore");
const yearControls = d3.select(".year-controls");

function getStageConfig() {
    const stage = stages[stageIndex];
    const isDashboard = stageIndex === 3;
    let focusYear;
    if (stage.focusYear && yearList.includes(stage.focusYear)) focusYear = stage.focusYear;
    else focusYear = isDashboard ? yearList[currentYearIndex] : yearList[0];
    const focusCountries = stage.focusCountries ? new Set(stage.focusCountries) : null;
    return { stage, isDashboard, focusYear, focusCountries };
}

function updateHero() {
    const s = stages[stageIndex];
    stageLabel.text(s.label);
    heroTitle.text(s.title);
    heroCopy.html(s.copy);
    heroPills.selectAll("*").remove();
    s.pills.forEach(t => heroPills.append("div").attr("class", "pill").text(t));
    bigWord.text(s.word);
    clusterToggleRow.classed("visible", stageIndex === 3);
    perceptionToggleRow.classed("visible", stageIndex === 3);
    if (stageIndex !== 3) {
        clusterMode = false;
        perceptionMode = false;
        clusterToggle.property("checked", false);
        perceptionToggle.property("checked", false);
        heroBox.classed("cluster-expanded", false).classed("perception-expanded", false);
    } else {
        perceptionMode = !!s.perceptionActive;
        perceptionToggle.property("checked", perceptionMode);
        heroBox.classed("perception-expanded", perceptionMode);
    }
    renderClusterLegend();
    renderPerceptionLegend();
}

function renderClusterLegend() {
    clusterLegend.selectAll("*").remove();
    if (!clusterMode || stageIndex !== 3) return;
    clusterDefs.forEach(c => {
        const row = clusterLegend.append("div").attr("class", "legend-item");
        row.append("span").attr("class", "legend-swatch").style("background", c.color);
        row.append("span").text(`Cluster ${c.id}: ${c.name} - ${c.codes.map(code => isoToFr[code]).join(", ")}`);
    });
}

function renderPerceptionLegend() {
    perceptionLegend.selectAll("*").remove();
    if (!perceptionMode) return;
    perceptionLegend.append("div").attr("class", "legend-item")
        .html(`<span class="legend-swatch" style="background: var(--perceptionGood)"></span><span>Bonheur subjectif supérieur : expansion couleur rouge cabernet</span>`);
    perceptionLegend.append("div").attr("class", "legend-item")
        .html(`<span class="legend-swatch" style="background: var(--perceptionBad)"></span><span>Bonheur subjectif inférieur: incrustation sombre</span>`);
    perceptionLegend.append("div").attr("class", "legend-item")
        .style("color", "#95a6b8")
        .text(" ");
}

function drawLegend() {
    const legend = d3.select("#legend");
    legend.selectAll("*").remove();
    if (stageIndex === 0) { hud.style("display", "none"); return; }
    hud.style("display", "block");

    const metaGroups = [
        { title: "Économie et emploi", items: ["Revenu et patrimoine", "Travail et qualité de l'emploi"], desc: " " },
        { title: "Conditions de vie et santé", items: ["Logement", "Equilibre travail-vie", "Santé", "Qualité environnementale"], desc: " " },
        { title: "Cohésion sociale", items: ["Liens sociaux", "Engagement civique", "Sécurité", "Savoirs et compétences"], desc: " " }
    ];

    const group = legend.selectAll(".legend-meta").data(metaGroups).enter().append("div").attr("class", "legend-meta")
        .style("display", "flex").style("flex-direction", "column").style("gap", "6px").style("margin-bottom", "10px");

    group.append("div").style("font-size", "11px").style("font-weight", "700").style("color", "#e8eef6").style("letter-spacing", ".02em").text(d => d.title);
    group.append("div").style("font-size", "10px").style("color", "#95a6b8").style("line-height", "1.35").text(d => d.desc);

    group.each(function (groupData) {
        const row = d3.select(this).append("div").style("display", "flex").style("flex-wrap", "wrap").style("gap", "7px 10px");
        groupData.items.forEach(k => {
            const item = row.append("div").style("display", "flex").style("align-items", "center").style("gap", "6px");
            item.append("span").style("background", colors.get(k)).style("width", "10px").style("height", "10px").style("border-radius", "2px");
            item.append("span").text(k);
        });
    });
}

function drawGrid(maxH) {
    gridLayer.selectAll("*").remove();
    const steps = 5;
    const scale = d3.scaleLinear().domain([0, maxH]).range([innerRadius, outerRadius]);
    for (let i = 1; i <= steps; i++) {
        const v = (maxH / steps) * i;
        const r = scale(v);
        gridLayer.append("circle").attr("r", r).attr("fill", "none").attr("stroke", "rgba(255,255,255,0.08)").attr("stroke-dasharray", "3,3");
        gridLayer.append("text").attr("y", -r).attr("text-anchor", "middle").attr("font-size", "10px").attr("fill", "#95a6b8").text(v.toFixed(1));
    }
}

function animateCenterUpdate(year, data) {
    if (stageIndex === 0) {
        selectedCenter.classed("focus", false);
        centerYear.text("");
        centerName.text("");
        centerScore.text("");
        return;
    }

    centerYear.interrupt()
        .transition()
        .duration(220)
        .ease(d3.easeCubicOut)
        .style("opacity", 0)
        .style("transform", "translateY(8px)")
        .on("end", function () {
            centerYear.text(year || "");
            centerYear.transition()
                .duration(stageIndex === 1 ? 520 : 320)
                .delay(stageIndex === 1 ? 120 : 0)
                .ease(d3.easeCubicOut)
                .style("opacity", 1)
                .style("transform", "translateY(0)");
        });

    if (stageIndex === 1) {
        selectedCenter.classed("focus", true);
        centerName.text("");
        centerScore.text("");
        return;
    }

    if (stageIndex === 2) {
        selectedCenter.classed("focus", true);
        if (!selectedCountry) {
            centerName.text("");
            centerScore.text("");
        } else {
            const focus = data.find(d => d["Pays"] === selectedCountry);
            centerName.text(focus ? focus["Pays"] : selectedCountry);
            centerScore.text(focus ? `Bonheur: ${focus.Happiness_Index.toFixed(3)}` : "No data for this year");
        }
        return;
    }

    selectedCenter.classed("focus", !!selectedCountry);
    if (!selectedCountry) {
        centerName.text("");
        centerScore.text("");
    } else {
        const focus = data.find(d => d["Pays"] === selectedCountry);
        centerName.text(focus ? focus["Pays"] : selectedCountry);
        centerScore.text(focus ? `Bonheur: ${focus.Happiness_Index.toFixed(3)}` : "No data for this year");
    }
}

function drawClock(data, year) {
    centerLayer.selectAll("*").remove();
    const angleScale = d3.scaleBand().domain(data.map(d => d["Pays"])).range([0, 2 * Math.PI]);
    const r = innerRadius - 18;
    data.forEach((d, i) => {
        const a = angleScale(d["Pays"]) + angleScale.bandwidth() / 2;
        centerLayer.append("text")
            .attr("x", Math.cos(a - Math.PI / 2) * r)
            .attr("y", Math.sin(a - Math.PI / 2) * r)
            .attr("text-anchor", "middle")
            .attr("font-size", "9px")
            .attr("fill", "#95a6b8")
            .text(i + 1);
    });
    animateCenterUpdate(year, data);
}

function drawCountryNames(data) {
    const angleScale = d3.scaleBand().domain(data.map(d => d["Pays"])).range([0, 2 * Math.PI]);
    const labelRadius = outerRadius + 72;
    const labels = dataLayer.selectAll(".country-name").data(data, d => d["Pays"]);
    labels.enter().append("text")
        .attr("class", "country-name")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#c9d4e2")
        .style("opacity", 0)
        .merge(labels)
        .interrupt()
        .transition()
        .duration(500)
        .style("opacity", d => {
            if (focusSet) return focusSet.has(d["Pays"]) ? 1 : 0.08;
            if (selectedCountry) return d["Pays"] === selectedCountry ? 1 : 0.18;
            return 1;
        })
        .attr("transform", d => {
            const a = angleScale(d["Pays"]) + angleScale.bandwidth() / 2;
            const x = Math.cos(a - Math.PI / 2) * labelRadius;
            const y = Math.sin(a - Math.PI / 2) * labelRadius;
            const isLeftSide = a > Math.PI / 2 && a < 3 * Math.PI / 2;
            const rot = (a * 180 / Math.PI) - 90 + (isLeftSide ? 180 : 0);
            return `translate(${x},${y}) rotate(${rot})`;
        })
        .attr("text-anchor", d => {
            const a = angleScale(d["Pays"]) + angleScale.bandwidth() / 2;
            return (a > Math.PI / 2 && a < 3 * Math.PI / 2) ? "end" : "start";
        })
        .text(d => d["Pays"]);
    labels.exit().remove();
}

function showTooltip(e, d, seg = null, year) {
    const { isDashboard } = getStageConfig();
    const storyMode = stageIndex === 1 || stageIndex === 2;
    const allowedInStory = storyMode && focusSet && focusSet.has(d["Pays"]);
    if (!isDashboard && !allowedInStory) return;

    clearTimeout(tooltipTimer);

    const y = year ?? currentYearForTooltip;
    const row = currentYearData.find(x => x["Pays"] === d["Pays"]);
    const happiness = row ? row.Happiness_Index : d.Happiness_Index;
    const subjective = row && row.Subjective_Index != null && !Number.isNaN(row.Subjective_Index)
        ? row.Subjective_Index
        : null;

    let html = `<b>${d["Pays"]}</b><br/>Année: ${y}<br/>Bonheur: ${happiness.toFixed(3)}`;

    if (stageIndex === 1 && subjective != null) {
        html += `<br/>Bonheur perçu: ${subjective.toFixed(3)}`;
    }

    if (stageIndex === 3 && perceptionMode && subjective != null) {
        html += `<br/>Bonheur perçu: ${subjective.toFixed(3)}`;
    }

    if (seg) {
        html += `<br/>${seg.key}: ${pct(seg.value)}`;
    }

    tooltip
        .style("opacity", 1)
        .style("left", (e.pageX + 10) + "px")
        .style("top", (e.pageY + 10) + "px")
        .html(html);

    tooltipTimer = setTimeout(() => tooltip.style("opacity", 0), 2000);
}

function hideTooltip() {
    clearTimeout(tooltipTimer);
    tooltip.style("opacity", 0);
}

function renderYear(data, year) {
    currentYearData = data;
    currentYearForTooltip = year;
    const maxH = d3.max(data, d => d.Happiness_Index) || 1;
    const maxS = d3.max(data.map(d => (d.Subjective_Index != null && !Number.isNaN(d.Subjective_Index)) ? d.Subjective_Index : 0)) || 1;
    const maxBoth = Math.max(maxH, maxS);

    drawGrid(maxBoth);
    drawClock(data, year);
    drawCountryNames(data);

    const angleScale = d3.scaleBand().domain(data.map(d => d["Pays"])).range([0, 2 * Math.PI]).padding(0.05);
    const radiusScale = d3.scaleLinear().domain([0, maxBoth]).range([innerRadius, outerRadius]);
    const arcGen = d3.arc().startAngle(basePad).endAngle(angleScale.bandwidth() - basePad);

    const { isDashboard } = getStageConfig();
    const focusName = isDashboard ? selectedCountry : null;

    const country = dataLayer.selectAll(".country").data(data, d => d["Pays"]);

    const countryEnter = country.enter()
        .append("g")
        .attr("class", "country")
        .style("will-change", "transform, opacity")
        .each(function (d) {
            this._angle = angleScale(d["Pays"]);
            this._focusScale = 1;
            this._baseTransform = `rotate(${angleScale(d["Pays"]) * 180 / Math.PI}) scale(1)`;
        });

    country.exit().interrupt().transition().duration(400).style("opacity", 0).remove();

    const group = countryEnter.merge(country);
    group.interrupt();

    const getTargetScale = d => {
        if (hoverCountryName && d["Pays"] === hoverCountryName) return 1.06;
        if (focusName && d["Pays"] === focusName) return 1.1;
        return 1;
    };

    group.transition()
        .duration(900)
        .delay((d, i) => i * 5)
        .ease(d3.easeCubicInOut)
        .attrTween("transform", function (d) {
            const prev = this._angle ?? angleScale(d["Pays"]);
            const next = angleScale(d["Pays"]);
            const interp = d3.interpolate(prev, next);
            this._angle = next;
            const startScale = this._focusScale || 1;
            const targetScale = getTargetScale(d);
            const scaleInterp = d3.interpolateNumber(startScale, targetScale);
            this._focusScale = targetScale;
            return t => `rotate(${interp(t) * 180 / Math.PI}) scale(${scaleInterp(t)})`;
        })
        .attr("opacity", d => {
            if (focusSet) return focusSet.has(d["Pays"]) ? 1 : 0.08;
            if (focusName) return d["Pays"] === focusName ? 1 : 0.18;
            return 1;
        });

    group
        .on("mouseenter", function (e, d) {
            if (!getStageConfig().isDashboard) return;
            if (selectedCountry && selectedCountry === d["Pays"]) return;
            hoverCountryName = d["Pays"];
            d3.select(this)
                .raise()
                .interrupt()
                .transition()
                .duration(160)
                .ease(d3.easeCubicOut)
                .attr("transform", `rotate(${angleScale(d["Pays"]) * 180 / Math.PI}) scale(1.12)`);
        })
        .on("mouseleave", function (e, d) {
            if (!getStageConfig().isDashboard) return;
            if (hoverCountryName === d["Pays"]) hoverCountryName = null;
            d3.select(this)
                .interrupt()
                .transition()
                .duration(160)
                .ease(d3.easeCubicOut)
                .attr("transform", d._baseTransform || `rotate(${angleScale(d["Pays"]) * 180 / Math.PI}) scale(1)`);
        })
        .on("click", function (e, d) {
            if (!getStageConfig().isDashboard) return;
            selectedCountry = selectedCountry === d["Pays"] ? null : d["Pays"];
            const year = yearList[currentYearIndex];
            const data = allData.filter(x => x["Année"] === year).sort((a, b) => d3.descending(a.Happiness_Index, b.Happiness_Index));
            renderYear(data, year);
        });

    group.each(function (d) {
        const g = d3.select(this);
        const ordered = secondaryCols.map(k => ({ key: k, value: +d[k] || 0 })).sort((a, b) => a.value - b.value);
        const total = d3.sum(ordered, x => x.value) || 1;
        const outer = radiusScale(d.Happiness_Index);

        let r = innerRadius;
        const segments = ordered.map(o => {
            const segSize = (outer - innerRadius) * (o.value / total);
            const r0 = r;
            const r1 = r + segSize;
            r = r1;
            return { ...o, r0, r1 };
        });

        const segSel = g.selectAll("path.seg").data(segments, s => s.key);
        const segEnter = segSel.enter()
            .append("path")
            .attr("class", "seg")
            .attr("fill", s => colors.get(s.key))
            .attr("stroke", "white")
            .attr("stroke-width", 0.3)
            .attr("opacity", 0)
            .attr("d", s => arcGen.innerRadius(innerRadius).outerRadius(innerRadius)())
            .style("filter", "none")
            .on("mouseenter", function (e, segData) {
                const { isDashboard } = getStageConfig();
                const storyMode = stageIndex === 1 || stageIndex === 2;
                const allowedInStory = storyMode && focusSet && focusSet.has(d["Pays"]);
                if (!isDashboard && !allowedInStory) return;
                d3.select(this)
                    .interrupt()
                    .raise()
                    .transition()
                    .duration(140)
                    .style("filter", "brightness(1.55) drop-shadow(0 0 7px rgba(255,255,255,0.35))");
                showTooltip(e, d, segData, currentYearForTooltip);
            })
            .on("mousemove", function (e, segData) {
                const { isDashboard } = getStageConfig();
                const storyMode = stageIndex === 1 || stageIndex === 2;
                const allowedInStory = storyMode && focusSet && focusSet.has(d["Pays"]);
                if (!isDashboard && !allowedInStory) return;
                showTooltip(e, d, segData, currentYearForTooltip);
            })
            .on("mouseleave", function () {
                const { isDashboard } = getStageConfig();
                const storyMode = stageIndex === 1 || stageIndex === 2;
                const allowedInStory = storyMode && focusSet && focusSet.has(d["Pays"]);
                if (!isDashboard && !allowedInStory) return;
                d3.select(this)
                    .interrupt()
                    .transition()
                    .duration(140)
                    .style("filter", "none");
                hideTooltip();
            });

        segSel.exit().interrupt().transition().duration(300).style("opacity", 0).remove();

        segEnter.merge(segSel)
            .interrupt()
            .transition()
            .duration(1000)
            .delay((s, i) => i * 8)
            .ease(d3.easeCubicInOut)
            .attr("fill", s => colors.get(s.key))
            .attr("opacity", () => {
                if (focusSet) return focusSet.has(d["Pays"]) ? 1 : 0.08;
                if (focusName) return d["Pays"] === focusName ? 1 : 0.18;
                return 1;
            })
            .style("filter", "none")
            .attrTween("d", function (s) {
                const prev = this._prevArc || { r0: innerRadius, r1: innerRadius };
                const i0 = d3.interpolateNumber(prev.r0, s.r0);
                const i1 = d3.interpolateNumber(prev.r1, s.r1);
                this._prevArc = { r0: s.r0, r1: s.r1 };
                return t => arcGen.innerRadius(i0(t)).outerRadius(i1(t))();
            });

        g.selectAll("path.cluster-outline").remove();
        if (stageIndex === 3 && clusterMode) {
            const cluster = countryToCluster.get(d["Pays"]);
            if (cluster) {
                const clusterArc = d3.arc()
                    .startAngle(basePad)
                    .endAngle(angleScale.bandwidth() - basePad)
                    .innerRadius(outer + 2.5)
                    .outerRadius(outer + 8.5);
                g.append("path")
                    .attr("class", `cluster-outline visible c${cluster.id}`)
                    .attr("d", clusterArc());
            }
        }

        g.selectAll("path.perception-ext").remove();
        if ((stageIndex === 3 && perceptionMode) || (stageIndex === 1 && stages[1].perceptionActive)) {
            const subjective = d.Subjective_Index;
            if (subjective != null && !Number.isNaN(subjective)) {
                const subjectiveR = radiusScale(subjective);
                const better = subjectiveR >= outer;
                const r0 = Math.min(outer, subjectiveR);
                const r1 = Math.max(outer, subjectiveR);
                if (r1 > r0) {
                    const extArc = d3.arc()
                        .startAngle(basePad)
                        .endAngle(angleScale.bandwidth() - basePad)
                        .innerRadius(r0)
                        .outerRadius(r1);
                    g.append("path")
                        .attr("class", `perception-ext ${better ? "good" : "bad"}`)
                        .attr("d", extArc())
                        .attr("fill", better ? "rgba(118, 183, 255, .30)" : "rgba(8, 8, 10, .80)")
                        .attr("stroke", better ? "rgba(118, 183, 255, .80)" : "rgba(0, 0, 0, .85)")
                        .attr("stroke-width", 1.1)
                        .style("mix-blend-mode", better ? "screen" : "multiply")
                        .style("opacity", better ? 1 : 0.95)
                        .style("filter", better ? "url(#perceptionGlow)" : "url(#perceptionGlowSoft)")
                        .style("pointer-events", "none");
                }
            }
        }
    });
}

function setYear(idx) {
    if (stageIndex === 3) {
        currentYearIndex = (idx + yearList.length) % yearList.length;
    } else {
        const fixed = stages[stageIndex].focusYear;
        if (fixed && yearList.includes(fixed)) currentYearIndex = yearList.indexOf(fixed);
    }

    const year = yearList[currentYearIndex];
    const data = allData.filter(d => d["Année"] === year).sort((a, b) => d3.descending(a.Happiness_Index, b.Happiness_Index));
    renderYear(data, year);
}

function applyStageMode() {
    const { focusYear, focusCountries } = getStageConfig();
    focusSet = focusCountries;
    yearControls.style("display", stageIndex === 3 ? "flex" : "none");
    wrap.classed("stage-intro", stageIndex === 0)
        .classed("stage-story", stageIndex === 1 || stageIndex === 2)
        .classed("stage-dashboard", stageIndex === 3);

    svg.interrupt();

    if (stageIndex === 0) {
        selectedCountry = null;
        hoverCountryName = null;
        svg.transition().duration(1200).ease(d3.easeCubicInOut)
            .style("filter", "blur(3px) brightness(0.72) grayscale(1)");
    } else if (stageIndex === 1) {
        svg.transition().duration(600).ease(d3.easeCubicInOut)
            .style("filter", "blur(1px) brightness(0.92) grayscale(0.25)")
            .transition().duration(350)
            .style("filter", "none");
    } else {
        svg.transition().duration(1000).ease(d3.easeCubicInOut)
            .style("filter", "none");
    }

    const focusIndex = yearList.indexOf(focusYear);
    if (focusIndex !== -1) currentYearIndex = focusIndex;
    drawLegend();
}

function animateCovidJump() {
    const has2020 = yearList.includes(2020);
    const has2021 = yearList.includes(2021);
    if (!has2020 || !has2021) {
        setYear(currentYearIndex);
        return;
    }
    currentYearIndex = yearList.indexOf(2020);
    const data2020 = allData.filter(d => d["Année"] === 2020).sort((a, b) => d3.descending(a.Happiness_Index, b.Happiness_Index));
    renderYear(data2020, 2020);
    setTimeout(() => {
        currentYearIndex = yearList.indexOf(2021);
        const data2021 = allData.filter(d => d["Année"] === 2021).sort((a, b) => d3.descending(a.Happiness_Index, b.Happiness_Index));
        renderYear(data2021, 2021);
    }, 1400);
}

function gotoStage(i) {
    lastStageIndex = stageIndex;
    stageIndex = (i + stages.length) % stages.length;
    updateHero();
    selectedCountry = null;
    hoverCountryName = null;
    applyStageMode();
    if (stageIndex === 2 && lastStageIndex !== 2) animateCovidJump();
    else setYear(currentYearIndex);
}

function togglePlay() {
    const { isDashboard } = getStageConfig();
    if (!isDashboard) return;
    playing = !playing;
    d3.select("#playPause").text(playing ? "Pause" : "Démarrer");
    if (playing) timer = setInterval(() => setYear(currentYearIndex + 1), 1800);
    else clearInterval(timer);
}

legendToggle.on("click", () => {
    const expanded = hud.classed("expanded");
    hud.classed("expanded", !expanded);
    legendToggle.text(expanded ? "+" : "-");
});

clusterToggle.on("change", () => {
    clusterMode = clusterToggle.property("checked") && stageIndex === 3;
    heroBox.classed("cluster-expanded", clusterMode);
    renderClusterLegend();
    setYear(currentYearIndex);
});

perceptionToggle.on("change", () => {
    perceptionMode = perceptionToggle.property("checked") && stageIndex === 3;
    heroBox.classed("perception-expanded", perceptionMode);
    renderPerceptionLegend();
    setYear(currentYearIndex);
});

d3.csv("final_wellbeing_dataset.csv", d => {
    d["Année"] = +d["Année"];
    d["Happiness_Index"] = +d["Happiness_Index"];
    d["Subjective_Index"] = (d["Subjective_Index"] === "" || d["Subjective_Index"] == null) ? null : +d["Subjective_Index"];
    secondaryCols.forEach(k => d[k] = +d[k] || 0);
    return d;
}).then(raw => {
    allData = raw;
    yearList = [...new Set(allData.map(d => d["Année"]))].sort((a, b) => a - b);

    drawLegend();
    updateHero();
    setYear(0);

    d3.select("#prevYear").on("click", () => setYear(currentYearIndex - 1));
    d3.select("#nextYear").on("click", () => setYear(currentYearIndex + 1));
    d3.select("#playPause").on("click", togglePlay);
    d3.select("#prevStage").on("click", () => gotoStage(stageIndex - 1));
    d3.select("#nextStage").on("click", () => gotoStage(stageIndex + 1));

    gotoStage(0);
    setTimeout(() => gotoStage(1), 10600);
    setTimeout(() => gotoStage(2), 18600);
    setTimeout(() => gotoStage(3), 24600);
});
