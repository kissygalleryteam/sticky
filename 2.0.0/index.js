/**
 * @fileoverview
 * @author
 * @module sticky
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     *
     * @class Sticky
     * @constructor
     * @extends Base
     */
    function Sticky(comConfig) {
        var self = this;
        //调用父类构造函数
        Sticky.superclass.constructor.call(self, comConfig);
    }
    S.extend(Sticky, Base, /** @lends Sticky.prototype*/{

    }, {ATTRS : /** @lends Sticky*/{

    }});
    return Sticky;
}, {requires:['node', 'base']});



