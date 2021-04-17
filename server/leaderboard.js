/**
 * Leaderboard to display scores
 */
class Leaderboard {
    /**
     * 
     * @param {Object[]} playerScores   // Players' scores
     */
    constructor(playerScores) {
        this.playerScores = playerScores;
    }

    /**
     * Update the leaderboard with new scores
     * 
     * @param {Object[]} playerScores   // Updated players' scores
     */
    update(playerScores) {
        this.playerScores = playerScores;
        $(".leaderboard").remove()
        
        // Create table
        var table = d3.select("body")
                      .append("table")
                      .attr("class", "leaderboard");
        
        // Create header
        table.append("thead")
             .append("tr")
             .selectAll("th")
             .data(["", "Player", "Kills"])
             .enter()
             .append("th")
             .text((d) => d);

        // Add row
        table.append("tbody")
             .selectAll("tr")
             .data(this.playerScores)
             .enter()
             .append("tr")
             .selectAll("td")
             .data((d) => d)
             .enter()
             .append("td")
             .text((d) => d);
    }
}

module.exports = Leaderboard;