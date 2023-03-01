import React, { Component } from "react";
import {
  Collapse,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
} from "reactstrap";
import { Link } from "react-router-dom";
import { LoginMenu } from "./api-authorization/LoginMenu";
import "./NavMenu.css";
import SearchBar from "./searchBar/SearchBar";
import OutsideAlerter from "./utility/OutsideAlerter";
import Notifications from "./Notifications";

export class NavMenu extends Component {
  static displayName = NavMenu.name;

  constructor(props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.hideSearchResults = this.hideSearchResults.bind(this);
    this.showSearchResults = this.showSearchResults.bind(this);
    this.state = {
      collapsed: true,
      showSearchResults: true,
    };
  }

  toggleNavbar() {
    this.setState({
      ...this.state,
      collapsed: !this.state.collapsed,
    });
  }

  hideSearchResults() {
    this.setState({
      ...this.state,
      showSearchResults: false,
    });
  }

  showSearchResults() {
    this.setState({
      ...this.state,
      showSearchResults: true,
    });
  }

  render() {
    return (
      <header>
        <Navbar
          className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3"
          container
          light
        >
          <NavbarBrand style={{ color: "white" }} tag={Link} to="/">
            GSTour
          </NavbarBrand>
          <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
          <Collapse
            className="d-sm-inline-flex flex-sm-row-reverse"
            isOpen={!this.state.collapsed}
            navbar
          >
            <ul className="navbar-nav flex-grow">
              <NavItem>
                <NavLink tag={Link} className="text-dark" to="/">
                  Home
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} className="text-dark" to="/Games">
                  Games
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} className="text-dark" to="/Events">
                  Events
                </NavLink>
              </NavItem>
              <LoginMenu></LoginMenu>
            </ul>
            <Notifications />
            <OutsideAlerter onClick={this.hideSearchResults}>
              <SearchBar
                showSearch={this.state.showSearchResults}
                onShowSearch={this.showSearchResults}
                onHideSearch={this.hideSearchResults}
              />
            </OutsideAlerter>
          </Collapse>
        </Navbar>
      </header>
    );
  }
}
